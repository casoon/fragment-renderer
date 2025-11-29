# Small Project Demo

This demo shows simple usage for small marketing sites and HTMX fragment endpoints.

## Features

- HTMX fragment rendering
- Pagination components
- FAQ blocks
- Price tables

## Installation

```bash
npm install
npm run dev
```

## Examples

### HTMX Fragment Endpoint

```typescript
// src/pages/api/faq.ts
import { createAstroRuntime } from '@skibidoo/container-runtime';
import FAQ from '../components/FAQ.astro';

const runtime = createAstroRuntime();

export async function GET({ request }) {
  const html = await runtime.renderComponent(FAQ, {
    items: [
      { question: 'What is AstroJS?', answer: 'A modern web framework.' },
      { question: 'How does HTMX work?', answer: 'Through HTML attributes.' },
    ],
  });

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

### Pagination

```typescript
// src/pages/api/products/[page].ts
import { createAstroRuntime } from '@skibidoo/container-runtime';
import ProductList from '../../components/ProductList.astro';

const runtime = createAstroRuntime();

export async function GET({ params }) {
  const page = parseInt(params.page) || 1;
  const products = await fetchProducts(page);

  return runtime.renderToResponse(ProductList, {
    products,
    currentPage: page,
    totalPages: 10,
  });
}
```
