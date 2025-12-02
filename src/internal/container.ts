import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { RenderContext } from "../types.js";

/**
 * Container options for rendering
 */
export interface ContainerRenderOptions {
	props?: Record<string, unknown>;
	slots?: Record<string, string | AstroComponentFactory>;
	context?: RenderContext;
}

/**
 * Internal wrapper around Astro Container API
 * Provides a stable interface for component rendering
 */
export class ContainerWrapper {
	private container: AstroContainer | null = null;

	/**
	 * Get or create the Astro container instance
	 */
	private async getContainer(): Promise<AstroContainer> {
		if (!this.container) {
			this.container = await AstroContainer.create();
		}
		return this.container;
	}

	/**
	 * Render a component to HTML string
	 */
	async render(
		component: AstroComponentFactory,
		options: ContainerRenderOptions = {},
	): Promise<string> {
		const container = await this.getContainer();

		const renderOptions: Parameters<typeof container.renderToString>[1] = {
			props: options.props ?? {},
			slots: options.slots as Record<string, string>,
		};

		// If context is provided, we can pass it through props
		// This allows components to access context via Astro.props.__context
		if (options.context) {
			renderOptions.props = {
				...renderOptions.props,
				__context: options.context,
			};
		}

		return await container.renderToString(component, renderOptions);
	}

	/**
	 * Dispose the container and clean up resources
	 */
	dispose(): void {
		this.container = null;
	}
}

/**
 * Create a new container wrapper instance
 */
export function createContainerWrapper(): ContainerWrapper {
	return new ContainerWrapper();
}
