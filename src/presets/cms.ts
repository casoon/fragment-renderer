import type { Preset, PresetConfig, RegistryEntry } from '../types.js';

/**
 * CMS preset configuration options
 */
export interface CMSPresetOptions {
  /** Default locale (default: 'en') */
  locale?: string;
  /** CMS provider name */
  provider?: string;
  /** Block component prefix (default: 'blocks.') */
  blockPrefix?: string;
  /** Pre-registered block components */
  blocks?: RegistryEntry[];
}

/**
 * CMS / Headless preset
 *
 * Configures the runtime for CMS block rendering:
 * - Registry-based component management
 * - Block rendering by ID
 * - Multi-channel output support
 *
 * @example
 * import { createAstroRuntime } from '@skibidoo/container-runtime';
 * import { cmsPreset } from '@skibidoo/container-runtime/presets/cms';
 *
 * const preset = cmsPreset({
 *   provider: 'contentful',
 *   blocks: [
 *     { id: 'blocks.hero', loader: () => import('./blocks/Hero.astro') },
 *     { id: 'blocks.feature-grid', loader: () => import('./blocks/FeatureGrid.astro') },
 *   ],
 * });
 *
 * const runtime = createAstroRuntime({
 *   baseContext: preset.baseContext,
 *   components: preset.components,
 *   services: preset.services,
 * });
 */
export const cmsPreset: Preset = (options?: CMSPresetOptions): PresetConfig => {
  const {
    locale = 'en',
    provider = 'generic',
    blockPrefix = 'blocks.',
    blocks = [],
  } = options ?? {};

  return {
    baseContext: {
      locale,
      channel: 'web',
      provider,
      isHeadless: true,
    },
    components: blocks,
    services: [
      {
        name: 'cms',
        factory: (runtime) => ({
          /**
           * Render a CMS block by type
           */
          async renderBlock(
            blockType: string,
            data: Record<string, unknown>,
            channel?: string
          ): Promise<string> {
            const componentId = blockType.startsWith(blockPrefix)
              ? blockType
              : `${blockPrefix}${blockType}`;

            return runtime.renderToString({
              componentId,
              props: data,
              context: channel ? { channel } : undefined,
            });
          },

          /**
           * Render multiple blocks in sequence
           */
          async renderBlocks(
            blocks: Array<{ type: string; data: Record<string, unknown> }>,
            channel?: string
          ): Promise<string> {
            const rendered = await Promise.all(
              blocks.map((block) => this.renderBlock(block.type, block.data, channel))
            );
            return rendered.join('\n');
          },

          /**
           * Check if a block type is registered
           */
          hasBlock(blockType: string): boolean {
            const componentId = blockType.startsWith(blockPrefix)
              ? blockType
              : `${blockPrefix}${blockType}`;
            return runtime.getComponent(componentId) !== undefined;
          },

          /**
           * List all registered block types
           */
          listBlocks(): string[] {
            return runtime
              .listComponents()
              .filter((entry) => entry.id.startsWith(blockPrefix))
              .map((entry) => entry.id.replace(blockPrefix, ''));
          },

          /**
           * Create a page from an array of blocks
           */
          async renderPage(
            blocks: Array<{ type: string; data: Record<string, unknown> }>,
            options?: {
              channel?: string;
              wrapper?: {
                componentId: string;
                props?: Record<string, unknown>;
              };
            }
          ): Promise<string> {
            const content = await this.renderBlocks(blocks, options?.channel);

            if (options?.wrapper) {
              return runtime.renderToString({
                componentId: options.wrapper.componentId,
                props: {
                  ...options.wrapper.props,
                  content,
                },
                context: options?.channel ? { channel: options.channel } : undefined,
              });
            }

            return content;
          },

          /**
           * Transform CMS data to block props
           * Override this for provider-specific transformations
           */
          transformData(
            cmsData: Record<string, unknown>,
            blockType: string
          ): Record<string, unknown> {
            // Default: pass through as-is
            return cmsData;
          },
        }),
      },
    ],
  };
};

export default cmsPreset;
