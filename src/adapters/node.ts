import type { IncomingMessage, ServerResponse } from "node:http";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { AstroRuntime, RenderContext } from "../types.js";

/**
 * Node.js HTTP adapter options
 */
export interface NodeAdapterOptions {
	/** Default status code (default: 200) */
	defaultStatus?: number;
	/** Default content type (default: 'text/html; charset=utf-8') */
	defaultContentType?: string;
	/** Custom headers to add to all responses */
	defaultHeaders?: Record<string, string>;
}

/**
 * Create a Node.js HTTP handler from the runtime
 */
export function createNodeHandler(
	runtime: AstroRuntime,
	options: NodeAdapterOptions = {},
) {
	const {
		defaultStatus = 200,
		defaultContentType = "text/html; charset=utf-8",
		defaultHeaders = {},
	} = options;

	return async function handler(
		component: AstroComponentFactory,
		props: Record<string, unknown>,
		res: ServerResponse,
		context?: RenderContext,
	): Promise<void> {
		try {
			const html = await runtime.renderComponent(component, props, context);

			res.writeHead(defaultStatus, {
				"Content-Type": defaultContentType,
				...defaultHeaders,
			});
			res.end(html);
		} catch (error) {
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end(
				`Error rendering component: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};
}

/**
 * Create a request handler that maps URL paths to component IDs
 */
export function createNodeRouteHandler(
	runtime: AstroRuntime,
	options: NodeAdapterOptions = {},
) {
	const {
		defaultStatus = 200,
		defaultContentType = "text/html; charset=utf-8",
		defaultHeaders = {},
	} = options;

	return async function routeHandler(
		req: IncomingMessage,
		res: ServerResponse,
		componentId: string,
		props?: Record<string, unknown>,
		context?: RenderContext,
	): Promise<void> {
		try {
			const html = await runtime.renderToString({
				componentId,
				props,
				context,
			});

			res.writeHead(defaultStatus, {
				"Content-Type": defaultContentType,
				...defaultHeaders,
			});
			res.end(html);
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end(`Component not found: ${componentId}`);
			} else {
				res.writeHead(500, { "Content-Type": "text/plain" });
				res.end(
					`Error rendering component: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}
	};
}

/**
 * Utility to parse URL query params as props
 */
export function parseQueryProps(url: string): Record<string, string> {
	const searchParams = new URL(url, "http://localhost").searchParams;
	const props: Record<string, string> = {};

	for (const [key, value] of searchParams) {
		props[key] = value;
	}

	return props;
}
