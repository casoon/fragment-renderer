# Cloudflare Worker Demo

This demo shows how to use the AstroJS Container Runtime in Cloudflare Workers.

## Features

- Edge rendering of Astro components
- Fragment endpoints for HTMX
- Caching support

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run deploy
```

## Example

```typescript
import { createAstroRuntime } from '@skibidoo/container-runtime';
import { createCloudflareHandler } from '@skibidoo/container-runtime/adapters/cloudflare';
import Widget from './components/Widget.astro';

const runtime = createAstroRuntime();
const handler = createCloudflareHandler(runtime, {
  cacheControl: 'public, max-age=3600',
});

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/widget') {
      const title = url.searchParams.get('title') || 'Default Title';
      return handler(Widget, { title });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
```
