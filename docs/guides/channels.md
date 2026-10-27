---
title: Channels
description: One component for web, email, PDF and OG card output, selected through the render context.
order: 3
---

The runtime renders one component for any target. What differs per target is the **context**, and
the markup your component produces from it.

## How the context reaches a component

`RenderContext` has `locale`, `channel` and any further keys. For each render the runtime merges
`baseContext` with the context passed to the call (later keys win) and hands it to the component
as the prop `__context`:

```astro
---
const { title, __context } = Astro.props;
const isEmail = __context?.channel === 'email';
---
{isEmail ? <table role="presentation"><tr><td>{title}</td></tr></table> : <h1>{title}</h1>}
```

```ts
await runtime.renderComponent(Page, { title: 'Hello' }, { channel: 'email' });
```

`channel` is typed as `'web' | 'email' | 'pdf' | 'og' | 'widget' | string`. The runtime attaches no
behaviour to the values; they are a convention between your calling code and your components.

`renderToResponse` does not take a context argument; set the channel through `baseContext` or use
`renderComponent`.

## What each channel produces

| Channel | What you get from the runtime | What you do afterwards |
| --- | --- | --- |
| `web` | HTML fragment or document | Send it, or insert it with HTMX |
| `email` | HTML with inline styles from your template | `emailPreset` wraps it in an email-safe layout; hand it to your mail provider |
| `og` | An HTML document sized for the card (the example uses 1200 by 630 px) | Convert to PNG yourself, for example with Puppeteer or Playwright |
| `pdf` | HTML | Convert with a tool of your choice |
| `widget` | A self-contained fragment | Embed it where needed |

The runtime stops at HTML. There is no PNG or PDF renderer in this package.

## Examples in the repository

- `examples/email-demo`: order confirmation and welcome email, wrapped with `wrapInEmailLayout`.
- `examples/og-preview-demo`: `OGCard.astro` with title, description, author and colours as props.
- `examples/cms-block-demo`: four block components rendered through `cmsPreset`.

The [showcase](../../../showcase/) shows the HTML these produce when this site is built.
