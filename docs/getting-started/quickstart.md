---
title: Quick start
description: Render a component to a string and to a Response.
order: 2
---

## Render a component

```ts
import { createAstroRuntime } from '@casoon/fragment-renderer';
import Banner from './Banner.astro';

const runtime = createAstroRuntime();

const html = await runtime.renderComponent(Banner, {
  message: 'Important announcement!',
  type: 'info',
});
```

`html` is a string with the component's markup. The [start page](../../../) shows the real output of
exactly this call, produced when the site was built.

## Return a Response

```ts
export async function GET() {
  return runtime.renderToResponse(Banner, { message: 'Saved', type: 'success' });
}
```

`renderToResponse` sets `Content-Type: text/html; charset=utf-8` unless you pass a header or a
`contentType`. Status defaults to 200:

```ts
runtime.renderToResponse(Banner, props, {
  status: 201,
  headers: { 'Cache-Control': 'public, max-age=60' },
});
```

## Register components by ID

```ts
runtime.registerComponent('banner', () => import('./Banner.astro'));

const html = await runtime.renderToString({
  componentId: 'banner',
  props: { message: 'Hello' },
});
```

The loader runs on first use; the resolved component is cached. More in
[Registry and services](../../guides/registry-and-services/).

## Set a context

```ts
const runtime = createAstroRuntime({
  baseContext: { locale: 'de', channel: 'web' },
});
```

Without a `baseContext` the runtime uses `{ locale: undefined, channel: 'web' }`. How a component
reads the context is described under [Channels](../../guides/channels/).
