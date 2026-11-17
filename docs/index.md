---
title: Overview
description: What @casoon/fragment-renderer does, where it stops, and how this documentation is organised.
order: 0
---

`@casoon/fragment-renderer` wraps Astro's Container API in a small runtime. You hand it an Astro
component and props, and get an HTML string or a `Response` back, without an Astro page, route or
dev server around it.

## What it covers

- `createAstroRuntime()` renders a component directly: `renderComponent` returns a string,
  `renderToResponse` a `Response`.
- A **registry** maps IDs to lazily loaded components, with optional metadata and styles.
- **Services** are named factories whose instance is created once and then cached.
- A **render context** (`locale`, `channel`, free keys) is merged into every render.
- **Presets** for HTMX, email and CMS blocks configure context, services and components.
- **Adapters** for Node.js, Cloudflare Workers, Vercel and a file-writing CLI helper turn the
  string into the response type of the platform.

## Where it stops

The runtime produces HTML and nothing else. It does not convert HTML to PDF or PNG, inline CSS for
email clients, serve files or route requests. The channel `pdf` or `og` is a label in the context
that your component can read; see [Channels](guides/channels/). The full list is under
[Limits](reference/limits/).

## When to use it, and how it differs from Astro API endpoints

An Astro API endpoint runs inside an Astro app and its server. `createAstroRuntime()` renders
components where there is no Astro page: in a Cloudflare Worker, a Node server, an email pipeline
or a script. Inside an Astro app it works just as well in an API route, for example for HTMX
responses.

## In use

- [Rechenkiste](https://rechenkiste.casoon.dev): maths exercises for primary school; tasks and
  feedback arrive as HTMX fragments rendered from Astro components.
- [aha-template](https://github.com/casoon/aha-template): starter for Astro, HTMX, Alpine.js and
  Tailwind v4 that uses this runtime.
- [aha-stack-example](https://github.com/casoon/aha-stack-example): a Kanban demo that renders its
  fragments through the Container API directly, the principle this package wraps.

Further reading: [AHA stack, Rechenkiste and fragment-renderer](https://insights.casoon.de/artikel/aha-stack-rechenkiste-fragment-renderer/)
on CASOON Insights.

## How the docs are organised

- **Getting started**: install the package and render a first component.
- **Guides**: registry and services, presets, channels, adapters.
- **Reference**: the runtime API and its limits.

The examples on the [start page](../) and in the [showcase](../showcase/) are rendered by the
runtime during this site's build, from the components in the repository's `examples/` folder.
