import type { ShowcaseExample } from '@casoon/pages-theme/showcase';
import { cmsPage, escapeHtml, fragment, htmxHeaders, ogCard, orderEmail, pretty } from './render';

// Components and call sites are the ones in ../../examples; the HTML below is produced by the
// runtime in ../../src while this site builds.
const out = (html: string) => ({ html: escapeHtml(pretty(html)), kind: 'terminal' as const });

export const examples: ShowcaseExample[] = [
  {
    slug: 'fragment',
    title: 'HTML fragment',
    file: 'examples/cloudflare-worker-demo/src/components/Banner.astro',
    tags: ['web', 'renderComponent'],
    description: 'A component rendered without a page, as an HTMX endpoint or a worker would return it.',
    input: {
      lang: 'ts',
      code: `const runtime = createAstroRuntime();
const html = await runtime.renderComponent(Banner, {
  message: 'Important announcement!',
  type: 'info',
});`,
    },
    output: out(fragment),
  },
  {
    slug: 'email',
    title: 'Order confirmation email',
    file: 'examples/email-demo/templates/OrderConfirmation.astro',
    tags: ['email', 'emailPreset'],
    description: 'Table layout with inline styles from the template, wrapped by `wrapInEmailLayout`.',
    input: {
      lang: 'ts',
      code: `const preset = emailPreset({ provider: 'ses' });
const runtime = createAstroRuntime({
  baseContext: preset.baseContext,
  services: preset.services,
});
const email = await runtime.getService('email');

const html = await runtime.renderComponent(OrderConfirmation, {
  orderNumber: 'DE-2024-99812',
  customerName: 'Jane Doe',
  items: [{ name: 'Premium Abonnement (1 Jahr)', quantity: 1, price: '99.00 €' }],
  /* subtotal, shipping, total, shippingAddress */
});
email.wrapInEmailLayout(html, { title: 'Bestellbestätigung' });`,
    },
    output: out(orderEmail),
  },
  {
    slug: 'og-card',
    title: 'OG card',
    file: 'examples/og-preview-demo/templates/OGCard.astro',
    tags: ['og', 'channel'],
    description: 'An HTML document sized 1200 by 630 px. Turning it into a PNG is a separate step.',
    input: {
      lang: 'ts',
      code: `const runtime = createAstroRuntime({ baseContext: { channel: 'og' } });
const html = await runtime.renderComponent(OGCard, {
  title: 'Wie man Astro-Komponenten überall rendert',
  author: 'Jane Doe',
  bgColor: '#0f172a',
  accentColor: '#10b981',
});`,
    },
    output: out(ogCard),
  },
  {
    slug: 'cms-blocks',
    title: 'CMS blocks',
    file: 'examples/cms-block-demo/render-blocks.js',
    tags: ['registry', 'cmsPreset'],
    description: 'Block types from a CMS payload resolve to registered components by ID.',
    input: {
      lang: 'ts',
      code: `const runtime = createAstroRuntime(
  cmsPreset({
    blocks: [
      { id: 'blocks.hero', loader: () => import('./blocks/Hero.astro') },
      { id: 'blocks.feature-grid', loader: () => import('./blocks/FeatureGrid.astro') },
      { id: 'blocks.cta', loader: () => import('./blocks/CTA.astro') },
    ],
  }),
);
const cms = await runtime.getService('cms');
const html = await cms.renderBlocks([
  { type: 'hero', data: { title: 'Willkommen', ctaText: 'Jetzt starten' } },
  { type: 'feature-grid', data: { features: [/* … */] } },
  { type: 'cta', data: { title: 'Bereit?', primaryText: 'Weiter', primaryHref: '#order' } },
]);`,
    },
    output: out(cmsPage),
  },
  {
    slug: 'htmx-headers',
    title: 'HTMX response headers',
    file: 'src/presets/aha-stack.ts',
    tags: ['htmx', 'ahaStackPreset'],
    description: 'The `htmx` service builds the `HX-*` headers for a response.',
    input: {
      lang: 'ts',
      code: `const runtime = createAstroRuntime(ahaStackPreset({ locale: 'de' }));
const htmx = await runtime.getService('htmx');
htmx.getResponseHeaders({ trigger: 'cartUpdated', retarget: '#cart' });`,
    },
    output: { html: escapeHtml(JSON.stringify(htmxHeaders, null, 2)), kind: 'terminal' },
  },
];
