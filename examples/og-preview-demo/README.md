# OG Preview Demo

This demo shows how to use Astro components for OG card generation.

## Features

- OG card HTML generation
- Screenshot pipeline integration
- Dynamic titles and images

## Installation

```bash
npm install
```

## Usage

```bash
node generate-og.js
```

## Example

```typescript
import { createAstroRuntime } from '@casoon/fragment-renderer';
import OGCard from './templates/OGCard.astro';

const runtime = createAstroRuntime({
  baseContext: { channel: 'og' },
});

// Generate HTML for OG card
const html = await runtime.renderComponent(OGCard, {
  title: 'My Blog Post',
  description: 'An exciting description...',
  author: 'John Doe',
  date: '2024-01-15',
});

// HTML can then be converted to PNG with Puppeteer/Playwright
```

## Integration with Screenshot Tools

```typescript
import puppeteer from 'puppeteer';

async function generateOGImage(html: string, outputPath: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(html);
  await page.screenshot({ path: outputPath });
  
  await browser.close();
}
```
