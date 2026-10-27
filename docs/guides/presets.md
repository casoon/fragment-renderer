---
title: Presets
description: Three presets configure context, services and components for HTMX, email and CMS blocks.
order: 2
---

A preset is a function that returns a `PresetConfig`: a `baseContext`, optional `components` and
`services`. The shape matches `RuntimeConfig`, so a preset can be passed to `createAstroRuntime`
directly:

```ts
const runtime = createAstroRuntime(ahaStackPreset({ locale: 'de' }));
```

## AHA stack (Astro, HTMX, Alpine.js)

```ts
import { ahaStackPreset } from '@casoon/fragment-renderer/presets/aha-stack';
```

Context: `{ locale, channel: 'web', framework: 'aha-stack', htmx }`. Options: `locale` (default
`en`), `htmxHeaders` (default `true`). It registers the service `htmx`:

| Method | Result |
| --- | --- |
| `isHtmxRequest(request)` | `true` if the `HX-Request` header is `"true"` |
| `getTriggerInfo(request)` | `id`, `name`, `target`, `currentUrl` from the `HX-Trigger`, `HX-Trigger-Name`, `HX-Target`, `HX-Current-URL` headers |
| `getResponseHeaders({ retarget, reswap, trigger, refresh, redirect, pushUrl })` | Object with `HX-Retarget`, `HX-Reswap`, `HX-Trigger`, `HX-Refresh`, `HX-Redirect`, `HX-Push-Url` for the options you set |

```ts
const htmx = await runtime.getService('htmx');
if (htmx.isHtmxRequest(request)) {
  const html = await runtime.renderComponent(CartFragment, { items });
  return new Response(html, {
    headers: { 'Content-Type': 'text/html', ...htmx.getResponseHeaders({ trigger: 'cartUpdated' }) },
  });
}
```

## Email

```ts
import { emailPreset } from '@casoon/fragment-renderer/presets/email';
```

Context: `{ locale, channel: 'email', provider, inlineStyles }`. Options: `locale`, `provider`
(`generic`, `sendgrid`, `mailgun`, `ses`, `postmark`), `inlineStyles`. Service `email`:

| Method | Result |
| --- | --- |
| `renderEmail(componentId, props)` | `{ html, subject }`; the subject is the text of the first `<title>` in the HTML, if any |
| `wrapInEmailLayout(content, { title, preheader, backgroundColor })` | The content inside an XHTML 1.0 Transitional document with a centred 600 px table and an optional hidden preheader |
| `getSafeStyles()` | A list of 15 CSS property names commonly safe in email clients |

`provider` and `inlineStyles` are stored in the context; the preset itself does not change the
output based on them. It does not inline CSS: write inline styles in the template, as the
repository's email example does.

## CMS blocks

```ts
import { cmsPreset } from '@casoon/fragment-renderer/presets/cms';
```

Context: `{ locale, channel: 'web', provider, isHeadless: true }`. Options: `locale`, `provider`,
`blockPrefix` (default `blocks.`), `blocks` (a `RegistryEntry[]`). Service `cms`:

| Method | Result |
| --- | --- |
| `renderBlock(type, data, channel?)` | Renders `blocks.<type>` with `data` as props |
| `renderBlocks(blocks, channel?)` | Renders `{ type, data }[]` in parallel, joined with newlines, in input order |
| `renderPage(blocks, { channel, wrapper })` | Like `renderBlocks`; with `wrapper`, the result is passed as the `content` prop to the wrapper component |
| `hasBlock(type)`, `listBlocks()` | Check and list registered block types |

```ts
const runtime = createAstroRuntime(
  cmsPreset({
    blocks: [{ id: 'blocks.hero', loader: () => import('./Hero.astro') }],
  }),
);
const cms = await runtime.getService('cms');
const html = await cms.renderBlocks([{ type: 'hero', data: { title: 'Hello' } }]);
```

An unknown block type throws the registry's "not found" error.
