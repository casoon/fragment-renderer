import type { AstroRuntime, RenderContext } from '../types.js';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

/**
 * Vercel adapter options
 */
export interface VercelAdapterOptions {
  /** Default status code (default: 200) */
  defaultStatus?: number;
  /** Default content type (default: 'text/html; charset=utf-8') */
  defaultContentType?: string;
  /** Custom headers to add to all responses */
  defaultHeaders?: Record<string, string>;
  /** Cache-Control header for edge caching */
  cacheControl?: string;
}

/**
 * Create a Vercel Edge Function handler
 */
export function createVercelHandler(
  runtime: AstroRuntime,
  options: VercelAdapterOptions = {}
) {
  const {
    defaultStatus = 200,
    defaultContentType = 'text/html; charset=utf-8',
    defaultHeaders = {},
    cacheControl,
  } = options;

  return async function handler(
    component: AstroComponentFactory,
    props: Record<string, unknown>,
    context?: RenderContext
  ): Promise<Response> {
    try {
      const html = await runtime.renderComponent(component, props, context);

      const headers = new Headers({
        'Content-Type': defaultContentType,
        ...defaultHeaders,
      });

      if (cacheControl) {
        headers.set('Cache-Control', cacheControl);
      }

      return new Response(html, {
        status: defaultStatus,
        headers,
      });
    } catch (error) {
      return new Response(
        `Error rendering component: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        }
      );
    }
  };
}

/**
 * Create a Vercel Serverless Function handler
 * Compatible with the Next.js API routes pattern
 */
export function createVercelServerlessHandler(
  runtime: AstroRuntime,
  options: VercelAdapterOptions = {}
) {
  const {
    defaultStatus = 200,
    defaultContentType = 'text/html; charset=utf-8',
    defaultHeaders = {},
  } = options;

  return async function serverlessHandler(
    request: Request,
    componentId: string,
    propsOverride?: Record<string, unknown>,
    context?: RenderContext
  ): Promise<Response> {
    try {
      // Parse query params as props if no override provided
      const url = new URL(request.url);
      const queryProps: Record<string, string> = {};
      for (const [key, value] of url.searchParams) {
        queryProps[key] = value;
      }

      const props = propsOverride ?? queryProps;

      const html = await runtime.renderToString({
        componentId,
        props,
        context,
      });

      const headers = new Headers({
        'Content-Type': defaultContentType,
        ...defaultHeaders,
      });

      return new Response(html, {
        status: defaultStatus,
        headers,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return new Response(`Component not found: ${componentId}`, {
          status: 404,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      return new Response(
        `Error rendering component: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        }
      );
    }
  };
}

/**
 * Vercel Edge config export type
 */
export const config = {
  runtime: 'edge' as const,
};
