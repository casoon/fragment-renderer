---
title: Adapters
description: Node.js, Cloudflare Workers, Vercel and CLI helpers that turn rendered HTML into a platform response.
order: 4
---

Adapters are thin: they call the runtime, set headers and map errors to a status. They hold no
state of their own.

## Node.js

```ts
import { createServer } from 'node:http';
import { createNodeHandler, createNodeRouteHandler } from '@casoon/fragment-renderer/adapters/node';

const render = createNodeHandler(runtime);
const renderById = createNodeRouteHandler(runtime);

createServer((req, res) => render(Banner, { message: 'Hi' }, res));
// or: renderById(req, res, 'banner', { message: 'Hi' })
```

Options: `defaultStatus`, `defaultContentType`, `defaultHeaders`. Errors answer 500 as plain text; the
route handler answers 404 when the registry does not know the ID. `parseQueryProps(url)` turns the
query string into a props object of strings.

## Cloudflare Workers

```ts
import {
  createCloudflareRouteHandler,
  parseWorkerRequest,
} from '@casoon/fragment-renderer/adapters/cloudflare';

const renderById = createCloudflareRouteHandler(runtime, {
  cacheControl: 'public, max-age=3600',
});

export default {
  async fetch(request: Request) {
    const { pathname, props } = parseWorkerRequest(request);
    return renderById(pathname.slice(1), props);
  },
};
```

`createCloudflareHandler` renders a component object, `createCloudflareRouteHandler` a registry ID.
Options add `cacheControl`, which sets `Cache-Control`. The repository's
`examples/cloudflare-worker-demo` shows a worker with `/widget`, `/card`, `/banner` and `/health`.

The adapter only builds the `Response`. Whether Astro's container runs in your Workers bundle
depends on your build setup; that is not covered by this package's tests.

## Vercel

```ts
import { createVercelHandler, createVercelServerlessHandler, config }
  from '@casoon/fragment-renderer/adapters/vercel';
```

`createVercelHandler` renders a component for an Edge Function; the module also exports
`config = { runtime: 'edge' }`. `createVercelServerlessHandler(runtime)` returns
`(request, componentId, propsOverride?, context?)`: without `propsOverride` it uses the query
parameters of the request as props. As above, unknown IDs answer 404 and other errors 500.

## CLI

```ts
import { createCLIRenderer, runCLI } from '@casoon/fragment-renderer/adapters/cli';

const cli = createCLIRenderer(runtime, { outputDir: './dist', verbose: true });
await cli.renderByIdToFile('hero', 'pages/hero.html', { title: 'Hello' });
await cli.batchRender([
  { componentId: 'hero', outputPath: 'hero.html' },
  { componentId: 'cta', outputPath: 'cta.html' },
]);
```

Methods: `render`, `renderById`, `renderToFile`, `renderByIdToFile`, `batchRender` (sequential),
`printComponent`, `printById`. Files are written below `outputDir` (default `./dist`), and missing
folders are created. `runCLI(runtime, args)` is a minimal entry point: `args[0]` is the component
ID, `args[1]` an optional output path; without it the HTML goes to stdout.
