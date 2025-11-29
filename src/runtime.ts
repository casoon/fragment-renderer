import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type {
  AstroRuntime,
  ComponentLoader,
  RenderByIdOptions,
  RenderContext,
  RegistryEntry,
  ResponseOptions,
  RuntimeConfig,
  ServiceDefinition,
} from "./types.js";
import {
  ContainerWrapper,
  createContainerWrapper,
} from "./internal/container.js";
import {
  mergeContexts,
  createDefaultContext,
  validateContext,
} from "./internal/context.js";
import { resolveComponent } from "./internal/resolve-component.js";

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
      for (const entry of config.components) {
        this.registry.set(entry.id, entry);
      }
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
    meta?: Record<string, unknown>,
  ): void {
    if (!id || typeof id !== "string") {
      throw new Error("Component ID must be a non-empty string");
    }
    if (typeof loader !== "function") {
      throw new Error("Component loader must be a function");
    }

    this.registry.set(id, { id, loader, meta });
  }

  getComponent(id: string): RegistryEntry | undefined {
    return this.registry.get(id);
  }

  listComponents(): RegistryEntry[] {
    return Array.from(this.registry.values());
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

    return await this.container.render(component, {
      props: options.props,
      slots: options.slots,
      context: mergedContext,
    });
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
 */
export function createAstroRuntime(config?: RuntimeConfig): AstroRuntime {
  return new AstroRuntimeImpl(config);
}
