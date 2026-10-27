// @ts-check
import { fileURLToPath } from 'node:url';
import casoonPages from '@casoon/pages-theme';
import { defineConfig } from 'astro/config';

const siteDir = fileURLToPath(new URL('.', import.meta.url));

// The site renders ../src and ../examples at build time. Neither has node_modules in CI,
// so `astro/*` imports from there resolve against this project's Astro.
const astroFromSite = {
  name: 'astro-from-site',
  enforce: /** @type {const} */ ('pre'),
  /**
   * @this {{ resolve: (...args: any[]) => Promise<unknown> }}
   * @param {string} source
   * @param {string | undefined} importer
   * @param {object} options
   */
  async resolveId(source, importer, options) {
    if (!/^astro\//.test(source) || !importer || importer.startsWith(siteDir)) return null;
    return this.resolve(source, `${siteDir}package.json`, { ...options, skipSelf: true });
  },
};

// The rendered strings carry no component CSS, but importing an example component still pulls its
// <style> blocks (OGCard sets `body { color: white }`) into this site's stylesheet. Drop them.
const dropExampleStyles = {
  name: 'drop-example-styles',
  enforce: /** @type {const} */ ('post'),
  /**
   * @param {string} code
   * @param {string} id
   */
  transform(code, id) {
    if (!id.includes('/examples/') || !id.endsWith('.astro')) return null;
    return { code: code.replace(/^import\s+["'][^"']*type=style[^"']*["'];?\s*$/gm, ''), map: null };
  },
};

// Project page: https://casoon.github.io/<repo>/ — `base` is the GitHub Pages path.
export default defineConfig({
  site: 'https://casoon.github.io/fragment-renderer',
  base: '/fragment-renderer/',
  vite: { plugins: [astroFromSite, dropExampleStyles] },
  integrations: [
    casoonPages({
      name: 'fragment-renderer',
      description:
        'Renders Astro components outside of Astro pages: HTML fragments for HTMX, email, OG cards and CMS blocks, on Node.js and edge runtimes.',
      tagline: 'Render Astro components anywhere',
      repo: 'casoon/fragment-renderer',
      license: 'MIT',
      packages: [
        { label: 'npm', href: 'https://www.npmjs.com/package/@casoon/fragment-renderer' },
      ],
      changelog: false,
      docsGroups: {
        'getting-started': 'Getting started',
        guides: 'Guides',
        reference: 'Reference',
      },
    }),
  ],
});
