import type { RenderContext } from "../types.js";

/**
 * Merge multiple contexts together
 * Later contexts override earlier ones
 */
export function mergeContexts(
	...contexts: (RenderContext | undefined)[]
): RenderContext {
	const result: RenderContext = {};

	for (const ctx of contexts) {
		if (ctx) {
			Object.assign(result, ctx);
		}
	}

	return result;
}

/**
 * Create a default context
 */
export function createDefaultContext(): RenderContext {
	return {
		locale: undefined,
		channel: "web",
	};
}

/**
 * Validate a context object
 */
export function validateContext(context: RenderContext): void {
	if (typeof context !== "object" || context === null) {
		throw new Error("Context must be an object");
	}
}
