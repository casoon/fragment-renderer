# @casoon/fragment-renderer

Universal Astro Container Runtime - render Astro components outside of classic Astro pages.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue-blue.svg)](https://www.gnu.org/licenses/mit)

## Features

- **Zero-Config** - Just call `createAstroRuntime()` and start rendering
- **Component Registry** - Register components by ID for dynamic rendering
- **Service Pattern** - Reusable services with caching
- **Multi-Channel** - Web, Email, PDF, OG-Cards from one component
- **Presets** - Pre-configured setups for common use cases
- **Adapters** - Node.js, Cloudflare Workers, Vercel Edge, CLI

## Installation

```bash
npm install @casoon/fragment-renderer
```

**Peer Dependency:** Requires `astro >= 4.0.0`

## Quick Start

```typescript
import { createAstroRuntime } from '@casoon/fragment-renderer';
import MyComponent from './MyComponent.astro';

const runtime = createAstroRuntime();

// Render to HTML string
const html = await runtime.renderComponent(MyComponent, { title: 'Hello' });

// Render to Response (for API endpoints)
const response = await runtime.renderToResponse(MyComponent, { title: 'Hello' });
```

## Presets

### AHA-Stack Preset (Astro + HTMX + Alpine.js)

```typescript
import { createAstroRuntime } from '@casoon/fragment-renderer';
import { ahaStackPreset } from '@casoon/fragment-renderer/presets/aha-stack';

const runtime = createAstroRuntime(ahaStackPreset({ locale: 'de' }));

const htmx = await runtime.getService('htmx');
htmx.isHtmxRequest(request);
htmx.getResponseHeaders({ trigger: 'cartUpdated' });
```

### Email Preset

```typescript
import { emailPreset } from '@casoon/fragment-renderer/presets/email';

const runtime = createAstroRuntime(emailPreset({ provider: 'sendgrid' }));
const email = await runtime.getService('email');

const { html, subject } = await email.renderEmail('order-confirmation', props);
```

### CMS Preset

```typescript
import { cmsPreset } from '@casoon/fragment-renderer/presets/cms';

const runtime = createAstroRuntime(cmsPreset({
  blocks: [
    { id: 'blocks.hero', loader: () => import('./Hero.astro') },
  ],
}));

const cms = await runtime.getService('cms');
const html = await cms.renderBlocks(blocks);
```

## Adapters

- **Node.js** - `@casoon/fragment-renderer/adapters/node`
- **Vercel** - `@casoon/fragment-renderer/adapters/vercel`
- **Cloudflare** - `@casoon/fragment-renderer/adapters/cloudflare`
- **CLI** - `@casoon/fragment-renderer/adapters/cli`

## License

MIT

## Links

- [GitHub](https://github.com/casoon/fragment-renderer)
- [Issues](https://github.com/casoon/fragment-renderer/issues)
