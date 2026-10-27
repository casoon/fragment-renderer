// Renders the repository's own example components with the runtime from ../../src.
import { createAstroRuntime } from '../../src/runtime';
import { ahaStackPreset } from '../../src/presets/aha-stack';
import { cmsPreset } from '../../src/presets/cms';
import { emailPreset } from '../../src/presets/email';
import Banner from '../../examples/cloudflare-worker-demo/src/components/Banner.astro';
import CTA from '../../examples/cms-block-demo/blocks/CTA.astro';
import FeatureGrid from '../../examples/cms-block-demo/blocks/FeatureGrid.astro';
import Hero from '../../examples/cms-block-demo/blocks/Hero.astro';
import OrderConfirmation from '../../examples/email-demo/templates/OrderConfirmation.astro';
import OGCard from '../../examples/og-preview-demo/templates/OGCard.astro';

export const fragment = await createAstroRuntime().renderComponent(Banner, {
  message: 'Important announcement!',
  type: 'info',
});

const emailRuntimePreset = emailPreset({ provider: 'ses' });
const emailRuntime = createAstroRuntime({
  baseContext: emailRuntimePreset.baseContext,
  services: emailRuntimePreset.services,
});
const email = await emailRuntime.getService<{
  wrapInEmailLayout(html: string, o: { title?: string; preheader?: string }): string;
}>('email');
export const orderEmail = email.wrapInEmailLayout(
  await emailRuntime.renderComponent(OrderConfirmation, {
    orderNumber: 'DE-2024-99812',
    customerName: 'Jane Doe',
    items: [
      { name: 'Premium Abonnement (1 Jahr)', quantity: 1, price: '99.00 €' },
      { name: 'Einrichtungsgebühr', quantity: 1, price: '0.00 €' },
    ],
    subtotal: '99.00 €',
    shipping: '0.00 €',
    total: '99.00 €',
    shippingAddress: 'Jane Doe\nMusterstraße 1\n10115 Berlin',
  }),
  { title: 'Bestellbestätigung', preheader: 'Vielen Dank für Ihren Einkauf!' },
);

export const ogCard = await createAstroRuntime({ baseContext: { channel: 'og' } }).renderComponent(
  OGCard,
  {
    title: 'Wie man Astro-Komponenten überall rendert',
    description: 'Ein Einblick in den @casoon/fragment-renderer.',
    author: 'Jane Doe',
    date: '01. Juni 2026',
    bgColor: '#0f172a',
    accentColor: '#10b981',
  },
);

const cmsConfig = cmsPreset({
  blocks: [
    { id: 'blocks.hero', loader: async () => ({ default: Hero }) },
    { id: 'blocks.feature-grid', loader: async () => ({ default: FeatureGrid }) },
    { id: 'blocks.cta', loader: async () => ({ default: CTA }) },
  ],
});
const cmsRuntime = createAstroRuntime({
  baseContext: cmsConfig.baseContext,
  components: cmsConfig.components,
  services: cmsConfig.services,
});
const cms = await cmsRuntime.getService<{
  renderBlocks(b: { type: string; data: Record<string, unknown> }[]): Promise<string>;
}>('cms');
export const cmsPage = await cms.renderBlocks([
  { type: 'hero', data: { title: 'Willkommen', subtitle: 'Gebaut mit Astro.', ctaText: 'Jetzt starten', ctaHref: '#start' } },
  {
    type: 'feature-grid',
    data: { features: [{ icon: '1', title: 'Zero-Config', description: 'Sofort startbereit.' }] },
  },
  { type: 'cta', data: { title: 'Bereit?', primaryText: 'Weiter', primaryHref: '#order' } },
]);

export const htmxHeaders = (
  await createAstroRuntime(ahaStackPreset({ locale: 'de' })).getService<{
    getResponseHeaders(o: { trigger?: string; retarget?: string }): Record<string, string>;
  }>('htmx')
).getResponseHeaders({ trigger: 'cartUpdated', retarget: '#cart' });

const VOID = new Set(['meta', 'br', 'img', 'input', 'link', 'hr']);

/** Line breaks and indentation for display only; the rendered strings above stay untouched. */
export function pretty(html: string): string {
  let depth = 0;
  return html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/>\s+</g, '><')
    .split(/(?=<)/)
    .map((part) => {
      const tag = /^<\/?([a-zA-Z0-9]+)/.exec(part);
      const closing = part.startsWith('</');
      if (closing) depth = Math.max(0, depth - 1);
      const line = `${'  '.repeat(depth)}${part.trim()}`;
      const openOnly = tag && !closing && !VOID.has(tag[1].toLowerCase()) && !part.includes('</');
      if (openOnly && !part.trimEnd().endsWith('/>')) depth += 1;
      return line;
    })
    .filter((l) => l.trim())
    .join('\n');
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
