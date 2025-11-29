# CMS Block Demo

This demo shows the registry feature for headless CMS block rendering.

## Features

- Component registry with IDs
- Block-based rendering
- Multi-channel support
- CMS service for block orchestration

## Installation

```bash
npm install
```

## Usage

```bash
node render-blocks.js
```

## Example

```typescript
import { createAstroRuntime } from '@skibidoo/container-runtime';
import { cmsPreset } from '@skibidoo/container-runtime/presets/cms';

// Preset with block registrations
const preset = cmsPreset({
  provider: 'contentful',
  blocks: [
    { id: 'blocks.hero', loader: () => import('./blocks/Hero.astro') },
    { id: 'blocks.feature-grid', loader: () => import('./blocks/FeatureGrid.astro') },
    { id: 'blocks.testimonial', loader: () => import('./blocks/Testimonial.astro') },
    { id: 'blocks.cta', loader: () => import('./blocks/CTA.astro') },
  ],
});

const runtime = createAstroRuntime({
  baseContext: preset.baseContext,
  components: preset.components,
  services: preset.services,
});

// CMS data from headless CMS
const pageBlocks = [
  { type: 'hero', data: { title: 'Welcome', subtitle: 'To our service' } },
  { type: 'feature-grid', data: { features: [...] } },
  { type: 'cta', data: { text: 'Get Started', href: '/signup' } },
];

// Render all blocks
const cms = await runtime.getService('cms');
const html = await cms.renderBlocks(pageBlocks);
```
