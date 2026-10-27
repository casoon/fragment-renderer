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

## How the docs are organised

- **Getting started**: install the package and render a first component.
- **Guides**: registry and services, presets, channels, adapters.
- **Reference**: the runtime API and its limits.

The examples on the [start page](../) and in the [showcase](../showcase/) are rendered by the
runtime during this site's build, from the components in the repository's `examples/` folder.
