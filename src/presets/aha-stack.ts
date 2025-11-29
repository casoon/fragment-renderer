import type { Preset, PresetConfig } from '../types.js';

/**
 * AHA Stack preset configuration options
 */
export interface AHAStackPresetOptions {
  /** Default locale (default: 'en') */
  locale?: string;
  /** Enable HTMX-specific headers */
  htmxHeaders?: boolean;
}

/**
 * AHA Stack preset (Astro + HTMX + Alpine)
 *
 * Configures the runtime for typical AHA stack usage:
 * - HTMX fragment endpoints
 * - Alpine.js component rendering
 * - Partial HTML responses
 *
 * @example
 * import { createAstroRuntime } from '@casoon/fragment-renderer';
 * import { ahaStackPreset } from '@casoon/fragment-renderer/presets/aha-stack';
 *
 * const preset = ahaStackPreset({ locale: 'de' });
 * const runtime = createAstroRuntime({
 *   baseContext: preset.baseContext,
 * });
 */
export const ahaStackPreset: Preset = (options?: AHAStackPresetOptions): PresetConfig => {
  const {
    locale = 'en',
    htmxHeaders = true,
  } = options ?? {};

  return {
    baseContext: {
      locale,
      channel: 'web',
      framework: 'aha-stack',
      htmx: htmxHeaders,
    },
    components: [],
    services: [
      {
        name: 'htmx',
        factory: () => ({
          /**
           * Create HTMX-specific response headers
           */
          getResponseHeaders(options?: {
            retarget?: string;
            reswap?: string;
            trigger?: string;
            refresh?: boolean;
            redirect?: string;
            pushUrl?: string;
          }) {
            const headers: Record<string, string> = {};

            if (options?.retarget) {
              headers['HX-Retarget'] = options.retarget;
            }
            if (options?.reswap) {
              headers['HX-Reswap'] = options.reswap;
            }
            if (options?.trigger) {
              headers['HX-Trigger'] = options.trigger;
            }
            if (options?.refresh) {
              headers['HX-Refresh'] = 'true';
            }
            if (options?.redirect) {
              headers['HX-Redirect'] = options.redirect;
            }
            if (options?.pushUrl) {
              headers['HX-Push-Url'] = options.pushUrl;
            }

            return headers;
          },

          /**
           * Check if a request is from HTMX
           */
          isHtmxRequest(request: Request): boolean {
            return request.headers.get('HX-Request') === 'true';
          },

          /**
           * Get the HTMX trigger element info
           */
          getTriggerInfo(request: Request) {
            return {
              id: request.headers.get('HX-Trigger'),
              name: request.headers.get('HX-Trigger-Name'),
              target: request.headers.get('HX-Target'),
              currentUrl: request.headers.get('HX-Current-URL'),
            };
          },
        }),
      },
    ],
  };
};

export default ahaStackPreset;
