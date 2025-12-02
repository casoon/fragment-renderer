import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import {
	type ContainerWrapper,
	createContainerWrapper,
} from "./internal/container.js";
import {
	createDefaultContext,
	mergeContexts,
	validateContext,
} from "./internal/context.js";
import { resolveComponent } from "./internal/resolve-component.js";
import type {
	AstroRuntime,
	ComponentFilter,
	ComponentLoader,
	ComponentMeta,
	RegistryEntry,
	RenderByIdOptions,
	RenderContext,
	ResponseOptions,
	RuntimeConfig,
	ServiceDefinition,
} from "./types.js";

/**
 * Implementation of the AstroRuntime
 */
class AstroRuntimeImpl implements AstroRuntime {
	private container: ContainerWrapper;
	private baseContext: RenderContext;
	private registry: Map<string, RegistryEntry>;
	private services: Map<string, ServiceDefinition>;
	private serviceInstances: Map<string, unknown>;

	constructor(config: RuntimeConfig = {}) {
		this.container = createContainerWrapper();
		this.baseContext = config.baseContext ?? createDefaultContext();
		this.registry = new Map();
		this.services = new Map();
		this.serviceInstances = new Map();

		// Register initial components
		if (config.components) {
			this.registerComponents(config.components);
		}

		// Register initial services
		if (config.services) {
			for (const service of config.services) {
				this.services.set(service.name, service);
			}
		}
	}

	// ─────────────────────────────────────────────────────────────────
	// Rendering
	// ─────────────────────────────────────────────────────────────────

	async renderComponent(
		component: AstroComponentFactory,
		props?: Record<string, unknown>,
		context?: RenderContext,
	): Promise<string> {
		const mergedContext = mergeContexts(this.baseContext, context);

		return await this.container.render(component, {
			props,
			context: mergedContext,
		});
	}

	async renderToResponse(
		component: AstroComponentFactory,
		props?: Record<string, unknown>,
		options?: ResponseOptions,
	): Promise<Response> {
		const html = await this.renderComponent(component, props);

		const headers = new Headers(options?.headers);
		if (!headers.has("Content-Type")) {
			headers.set(
				"Content-Type",
				options?.contentType ?? "text/html; charset=utf-8",
			);
		}

		return new Response(html, {
			status: options?.status ?? 200,
			headers,
		});
	}

	// ─────────────────────────────────────────────────────────────────
	// Registry
	// ─────────────────────────────────────────────────────────────────

	registerComponent(
		id: string,
		loader: ComponentLoader,
		meta?: ComponentMeta,
	): void {
		if (!id || typeof id !== "string") {
			throw new Error("Component ID must be a non-empty string");
		}
		if (typeof loader !== "function") {
			throw new Error("Component loader must be a function");
		}

		this.registry.set(id, { id, loader, meta });
	}

	registerComponents(entries: RegistryEntry[]): void {
		if (!Array.isArray(entries)) {
			throw new Error("entries must be an array of RegistryEntry");
		}

		for (const entry of entries) {
			if (!entry.id || typeof entry.id !== "string") {
				throw new Error("Each entry must have a non-empty string id");
			}
			if (typeof entry.loader !== "function") {
				throw new Error(`Component "${entry.id}" must have a loader function`);
			}

			this.registry.set(entry.id, entry);
		}
	}

	hasComponent(id: string): boolean {
		return this.registry.has(id);
	}

	getComponent(id: string): RegistryEntry | undefined {
		return this.registry.get(id);
	}

	listComponents(filter?: ComponentFilter): RegistryEntry[] {
		const entries = Array.from(this.registry.values());

		if (!filter) {
			return entries;
		}

		return entries.filter((entry) => {
			// Filter by category
			if (filter.category && entry.meta?.category !== filter.category) {
				return false;
			}

			// Filter by single tag
			if (filter.tag) {
				const tags = entry.meta?.tags ?? [];
				if (!tags.includes(filter.tag)) {
					return false;
				}
			}

			// Filter by multiple tags (must have all)
			if (filter.tags && filter.tags.length > 0) {
				const entryTags = entry.meta?.tags ?? [];
				const hasAllTags = filter.tags.every((tag) => entryTags.includes(tag));
				if (!hasAllTags) {
					return false;
				}
			}

			// Custom predicate filter
			if (filter.predicate && !filter.predicate(entry)) {
				return false;
			}

			return true;
		});
	}

	unregisterComponent(id: string): boolean {
		return this.registry.delete(id);
	}

	async renderToString(options: RenderByIdOptions): Promise<string> {
		const entry = this.registry.get(options.componentId);
		if (!entry) {
			throw new Error(
				`Component "${options.componentId}" not found in registry`,
			);
		}

		const component = await resolveComponent(entry);
		const mergedContext = mergeContexts(this.baseContext, options.context);

		let html = await this.container.render(component, {
			props: options.props,
			slots: options.slots,
			context: mergedContext,
		});

		// Append component styles if defined
		if (entry.styles) {
			html = `<style>${entry.styles}</style>\n${html}`;
		}

		return html;
	}

	// ─────────────────────────────────────────────────────────────────
	// Context & Services
	// ─────────────────────────────────────────────────────────────────

	setBaseContext(context: RenderContext): void {
		validateContext(context);
		this.baseContext = context;
	}

	getBaseContext(): RenderContext {
		return { ...this.baseContext };
	}

	registerService<T>(
		name: string,
		factory: (runtime: AstroRuntime) => T | Promise<T>,
	): void {
		if (!name || typeof name !== "string") {
			throw new Error("Service name must be a non-empty string");
		}
		if (typeof factory !== "function") {
			throw new Error("Service factory must be a function");
		}

		this.services.set(name, { name, factory });
		// Clear cached instance if re-registering
		this.serviceInstances.delete(name);
	}

	async getService<T>(name: string): Promise<T> {
		// Check for cached instance
		if (this.serviceInstances.has(name)) {
			return this.serviceInstances.get(name) as T;
		}

		const definition = this.services.get(name);
		if (!definition) {
			throw new Error(`Service "${name}" not registered`);
		}

		// Create and cache the instance
		const instance = await definition.factory(this);
		this.serviceInstances.set(name, instance);
		return instance as T;
	}

	hasService(name: string): boolean {
		return this.services.has(name);
	}
}

/**
 * Create a new Astro runtime instance
 *
 * @example
 * // Simple usage - no config needed
 * const runtime = createAstroRuntime();
 * const html = await runtime.renderComponent(MyComponent, { title: 'Hello' });
 *
 * @example
 * // With registry and services
 * const runtime = createAstroRuntime({
 *   baseContext: { locale: 'de', channel: 'web' },
 *   components: [
 *     { id: 'hero', loader: () => import('./Hero.astro') }
 *   ]
 * });
 * const html = await runtime.renderToString({ componentId: 'hero', props: { ... } });
 *
 * @example
 * // Bulk registration with filtering
 * import { uiComponents } from '@casoon/skibidoo-ui';
 *
 * const runtime = createAstroRuntime();
 * runtime.registerComponents(uiComponents);
 *
 * // List only form components
 * const formComponents = runtime.listComponents({ category: 'form' });
 */
export function createAstroRuntime(config?: RuntimeConfig): AstroRuntime {
	return new AstroRuntimeImpl(config);
}
