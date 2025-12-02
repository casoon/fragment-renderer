import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { AstroRuntime, RenderContext } from "../types.js";

/**
 * Cloudflare Worker adapter options
 */
export interface CloudflareAdapterOptions {
	/** Default status code (default: 200) */
	defaultStatus?: number;
	/** Default content type (default: 'text/html; charset=utf-8') */
	defaultContentType?: string;
	/** Custom headers to add to all responses */
	defaultHeaders?: Record<string, string>;
	/** Enable caching (sets Cache-Control header) */
	cacheControl?: string;
}

/**
 * Create a Cloudflare Worker fetch handler
 */
export function createCloudflareHandler(
	runtime: AstroRuntime,
	options: CloudflareAdapterOptions = {},
) {
	const {
		defaultStatus = 200,
		defaultContentType = "text/html; charset=utf-8",
		defaultHeaders = {},
		cacheControl,
	} = options;

	return async function handler(
		component: AstroComponentFactory,
		props: Record<string, unknown>,
		context?: RenderContext,
	): Promise<Response> {
		try {
			const html = await runtime.renderComponent(component, props, context);

			const headers = new Headers({
				"Content-Type": defaultContentType,
				...defaultHeaders,
			});

			if (cacheControl) {
				headers.set("Cache-Control", cacheControl);
			}

			return new Response(html, {
				status: defaultStatus,
				headers,
			});
		} catch (error) {
			return new Response(
				`Error rendering component: ${error instanceof Error ? error.message : "Unknown error"}`,
				{
					status: 500,
					headers: { "Content-Type": "text/plain" },
				},
			);
		}
	};
}

/**
 * Create a handler that uses the component registry
 */
export function createCloudflareRouteHandler(
	runtime: AstroRuntime,
	options: CloudflareAdapterOptions = {},
) {
	const {
		defaultStatus = 200,
		defaultContentType = "text/html; charset=utf-8",
		defaultHeaders = {},
		cacheControl,
	} = options;

	return async function routeHandler(
		componentId: string,
		props?: Record<string, unknown>,
		context?: RenderContext,
	): Promise<Response> {
		try {
			const html = await runtime.renderToString({
				componentId,
				props,
				context,
			});

			const headers = new Headers({
				"Content-Type": defaultContentType,
				...defaultHeaders,
			});

			if (cacheControl) {
				headers.set("Cache-Control", cacheControl);
			}

			return new Response(html, {
				status: defaultStatus,
				headers,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				return new Response(`Component not found: ${componentId}`, {
					status: 404,
					headers: { "Content-Type": "text/plain" },
				});
			}
			return new Response(
				`Error rendering component: ${error instanceof Error ? error.message : "Unknown error"}`,
				{
					status: 500,
					headers: { "Content-Type": "text/plain" },
				},
			);
		}
	};
}

/**
 * Parse request URL into componentId and props
 */
export function parseWorkerRequest(request: Request): {
	pathname: string;
	props: Record<string, string>;
} {
	const url = new URL(request.url);
	const props: Record<string, string> = {};

	for (const [key, value] of url.searchParams) {
		props[key] = value;
	}

	return {
		pathname: url.pathname,
		props,
	};
}

/**
 * Utility type for Cloudflare Worker environment
 */
export interface CloudflareEnv {
	[key: string]: unknown;
}

/**
 * Example worker export structure
 */
export interface CloudflareWorkerExports {
	fetch: (
		request: Request,
		env: CloudflareEnv,
		ctx: ExecutionContext,
	) => Promise<Response>;
}

/**
 * ExecutionContext type for Cloudflare Workers
 */
export interface ExecutionContext {
	waitUntil(promise: Promise<unknown>): void;
	passThroughOnException(): void;
}
