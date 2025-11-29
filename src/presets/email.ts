import type { Preset, PresetConfig } from '../types.js';

/**
 * Email preset configuration options
 */
export interface EmailPresetOptions {
  /** Default locale (default: 'en') */
  locale?: string;
  /** Email provider (for provider-specific optimizations) */
  provider?: 'generic' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark';
  /** Inline CSS styles (default: true) */
  inlineStyles?: boolean;
}

/**
 * Email preset
 *
 * Configures the runtime for email template rendering:
 * - Sets channel to 'email'
 * - Provides email-specific utilities
 * - Optimizes output for email clients
 *
 * @example
 * import { createAstroRuntime } from '@casoon/fragment-renderer';
 * import { emailPreset } from '@casoon/fragment-renderer/presets/email';
 *
 * const preset = emailPreset({ provider: 'sendgrid' });
 * const runtime = createAstroRuntime({
 *   baseContext: preset.baseContext,
 *   services: preset.services,
 * });
 */
export const emailPreset: Preset = (options?: EmailPresetOptions): PresetConfig => {
  const {
    locale = 'en',
    provider = 'generic',
    inlineStyles = true,
  } = options ?? {};

  return {
    baseContext: {
      locale,
      channel: 'email',
      provider,
      inlineStyles,
    },
    components: [],
    services: [
      {
        name: 'email',
        factory: (runtime) => ({
          /**
           * Render an email template with subject extraction
           */
          async renderEmail(
            componentId: string,
            props: Record<string, unknown>
          ): Promise<{
            html: string;
            text?: string;
            subject?: string;
          }> {
            const html = await runtime.renderToString({
              componentId,
              props,
              context: { channel: 'email' },
            });

            // Extract subject from <title> tag if present
            const subjectMatch = html.match(/<title>([^<]+)<\/title>/i);
            const subject = subjectMatch?.[1];

            return {
              html,
              subject,
            };
          },

          /**
           * Get email-safe CSS properties
           * Returns a subset of CSS that works across email clients
           */
          getSafeStyles(): string[] {
            return [
              'background-color',
              'border',
              'border-radius',
              'color',
              'font-family',
              'font-size',
              'font-weight',
              'height',
              'line-height',
              'margin',
              'padding',
              'text-align',
              'text-decoration',
              'vertical-align',
              'width',
            ];
          },

          /**
           * Wrap HTML in email-safe doctype and structure
           */
          wrapInEmailLayout(content: string, options?: {
            title?: string;
            preheader?: string;
            backgroundColor?: string;
          }): string {
            const { title = '', preheader = '', backgroundColor = '#f4f4f4' } = options ?? {};

            return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .fallback-font { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor};">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <tr>
            <td>
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
          },
        }),
      },
    ],
  };
};

export default emailPreset;
