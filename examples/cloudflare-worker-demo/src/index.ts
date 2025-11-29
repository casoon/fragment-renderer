import { createAstroRuntime } from '@skibidoo/container-runtime';
import {
  createCloudflareHandler,
  parseWorkerRequest,
  type CloudflareEnv,
  type ExecutionContext
} from '@skibidoo/container-runtime/adapters/cloudflare';

// Import components
// Note: In a real setup, these would be actual Astro components
// For demo purposes, we show the structure

const runtime = createAstroRuntime({
  baseContext: {
    channel: 'web',
    locale: 'de',
  },
});

// Register components
runtime.registerComponent('widget', () => import('./components/Widget.astro'));
runtime.registerComponent('card', () => import('./components/Card.astro'));
runtime.registerComponent('banner', () => import('./components/Banner.astro'));

const handler = createCloudflareHandler(runtime, {
  cacheControl: 'public, max-age=3600, s-maxage=86400',
});

export default {
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname, props } = parseWorkerRequest(request);

    try {
      switch (pathname) {
        case '/widget': {
          const component = await runtime.getComponent('widget');
          if (!component) {
            return new Response('Widget component not found', { status: 404 });
          }
          const html = await runtime.renderToString({
            componentId: 'widget',
            props: {
              title: props.title || 'Widget Title',
              content: props.content || 'Widget content goes here',
            },
          });
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }

        case '/card': {
          const html = await runtime.renderToString({
            componentId: 'card',
            props: {
              title: props.title || 'Card Title',
              description: props.description || 'Card description',
              imageUrl: props.image || '',
            },
          });
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }

        case '/banner': {
          const html = await runtime.renderToString({
            componentId: 'banner',
            props: {
              message: props.message || 'Important announcement!',
              type: props.type || 'info',
            },
          });
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=300',
            },
          });
        }

        case '/health': {
          return new Response(JSON.stringify({
            status: 'ok',
            components: runtime.listComponents().map(c => c.id),
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Render error:', error);
      return new Response(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { status: 500 }
      );
    }
  },
};
