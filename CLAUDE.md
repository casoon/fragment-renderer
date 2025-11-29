# @skibidoo/container-runtime – Project Description & Technical Guidelines

## Project Goal

The @skibidoo/container-runtime is a universal utility runtime for rendering Astro components outside of classic Astro pages. It's designed for both small marketing/content projects and large headless/multi-channel architectures – without config flags or mode switching.

The runtime provides:
- **Zero-Config** – Ready to use immediately, no setup required
- **Registry** – Register and render components by ID
- **Services** – Reusable services
- **Presets** – Pre-configured setups
- **Multi-Channel** – Web, Email, PDF, OG-HTML, Widgets

## Design Principles

1. **Zero-Config**  
   - Users just call `createAstroRuntime()` and can immediately render HTML from an Astro component.

2. **Progressive Extensibility**  
   - Registry, Services, Presets → only use when needed.

3. **No Framework, No Magic**  
   - Astro remains Astro. No custom build processes, no forced abstractions.

4. **Multi-Channel Rendering** out of the box  
   - Web, Email, PDF, OG-HTML, Widgets.

5. **Wrap Astro Container API**  
   - Simple, stable API for all Astro versions.

## Project Structure

```
@skibidoo/container-runtime/
├── src/
│   ├── index.ts              # Entry point with exports
│   ├── runtime.ts            # Main implementation
│   ├── types.ts              # TypeScript type definitions
│   ├── internal/
│   │   ├── container.ts      # Astro Container API wrapper
│   │   ├── context.ts        # Context merging
│   │   └── resolve-component.ts
│   ├── adapters/
│   │   ├── node.ts           # Node.js HTTP
│   │   ├── cloudflare.ts     # Cloudflare Workers
│   │   ├── vercel.ts         # Vercel Edge/Serverless
│   │   └── cli.ts            # CLI renderer
│   └── presets/
│       ├── aha-stack.ts      # Astro + HTMX + Alpine
│       ├── email.ts          # Email rendering
│       └── cms.ts            # Headless CMS blocks
├── examples/
│   ├── small-project-demo/   # Marketing site + HTMX
│   ├── email-demo/           # Email templates
│   ├── og-preview-demo/      # OG card generation
│   ├── cms-block-demo/       # CMS block rendering
│   └── cloudflare-worker-demo/
├── package.json
├── tsconfig.json
└── README.md
```

## API Overview

### Simple Usage

```typescript
import { createAstroRuntime } from '@skibidoo/container-runtime';
import MyComponent from './MyComponent.astro';

const runtime = createAstroRuntime();
const html = await runtime.renderComponent(MyComponent, { title: 'Hello' });
const response = await runtime.renderToResponse(MyComponent, { title: 'Hello' });
```

### With Registry, Services, Context

```typescript
const runtime = createAstroRuntime({
  baseContext: { locale: 'en', channel: 'web' },
});

// Registry
runtime.registerComponent('hero', () => import('./Hero.astro'));
const html = await runtime.renderToString({ componentId: 'hero', props: { ... } });

// Services
runtime.registerService('analytics', (rt) => ({ track: () => {} }));
const analytics = await runtime.getService('analytics');

// Context
runtime.setBaseContext({ locale: 'de' });
```

## Use Cases

1. **Marketing Site / HTMX Fragments** – No setup required
2. **Email Templates** – Channel 'email', provider presets
3. **OG Card Generation** – HTML to PNG pipeline
4. **CMS/Headless Blocks** – Registry with IDs, multi-channel
5. **Cloudflare Workers** – Edge rendering

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm test             # Run tests
```

## Technical Requirements

- Node.js >= 18.0.0
- Astro >= 4.0.0
- ESModules (`"type": "module"`)
- TypeScript strict mode
