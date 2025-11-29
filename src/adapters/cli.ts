import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { AstroRuntime, RenderContext } from '../types.js';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

/**
 * CLI adapter options
 */
export interface CLIAdapterOptions {
  /** Output directory for generated files (default: './dist') */
  outputDir?: string;
  /** Pretty print HTML output */
  prettyPrint?: boolean;
  /** Log progress to console */
  verbose?: boolean;
}

/**
 * Result of a render operation
 */
export interface RenderResult {
  /** Generated HTML content */
  html: string;
  /** Output file path (if written) */
  outputPath?: string;
  /** Component ID (if rendered by ID) */
  componentId?: string;
}

/**
 * Create a CLI renderer
 */
export function createCLIRenderer(
  runtime: AstroRuntime,
  options: CLIAdapterOptions = {}
) {
  const {
    outputDir = './dist',
    verbose = false,
  } = options;

  const log = (message: string) => {
    if (verbose) {
      console.log(`[astro-runtime] ${message}`);
    }
  };

  return {
    /**
     * Render a component and return the HTML
     */
    async render(
      component: AstroComponentFactory,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<string> {
      log('Rendering component...');
      const html = await runtime.renderComponent(component, props, context);
      log(`Rendered ${html.length} bytes`);
      return html;
    },

    /**
     * Render a component by ID and return the HTML
     */
    async renderById(
      componentId: string,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<string> {
      log(`Rendering component: ${componentId}`);
      const html = await runtime.renderToString({
        componentId,
        props,
        context,
      });
      log(`Rendered ${html.length} bytes`);
      return html;
    },

    /**
     * Render a component and write to file
     */
    async renderToFile(
      component: AstroComponentFactory,
      outputPath: string,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<RenderResult> {
      const html = await runtime.renderComponent(component, props, context);
      const fullPath = resolve(outputDir, outputPath);

      log(`Writing to ${fullPath}`);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, html, 'utf-8');
      log(`Written ${html.length} bytes to ${fullPath}`);

      return { html, outputPath: fullPath };
    },

    /**
     * Render a component by ID and write to file
     */
    async renderByIdToFile(
      componentId: string,
      outputPath: string,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<RenderResult> {
      const html = await runtime.renderToString({
        componentId,
        props,
        context,
      });
      const fullPath = resolve(outputDir, outputPath);

      log(`Writing ${componentId} to ${fullPath}`);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, html, 'utf-8');
      log(`Written ${html.length} bytes to ${fullPath}`);

      return { html, outputPath: fullPath, componentId };
    },

    /**
     * Batch render multiple components
     */
    async batchRender(
      items: Array<{
        componentId: string;
        outputPath: string;
        props?: Record<string, unknown>;
        context?: RenderContext;
      }>
    ): Promise<RenderResult[]> {
      log(`Batch rendering ${items.length} components...`);

      const results: RenderResult[] = [];
      for (const item of items) {
        const result = await this.renderByIdToFile(
          item.componentId,
          item.outputPath,
          item.props,
          item.context
        );
        results.push(result);
      }

      log(`Completed batch render: ${results.length} files`);
      return results;
    },

    /**
     * Print HTML to stdout
     */
    async printComponent(
      component: AstroComponentFactory,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<void> {
      const html = await runtime.renderComponent(component, props, context);
      console.log(html);
    },

    /**
     * Print component by ID to stdout
     */
    async printById(
      componentId: string,
      props?: Record<string, unknown>,
      context?: RenderContext
    ): Promise<void> {
      const html = await runtime.renderToString({
        componentId,
        props,
        context,
      });
      console.log(html);
    },
  };
}

/**
 * Simple CLI entry point for scripts
 */
export async function runCLI(
  runtime: AstroRuntime,
  args: string[]
): Promise<void> {
  const renderer = createCLIRenderer(runtime, { verbose: true });

  const componentId = args[0];
  const outputPath = args[1];

  if (!componentId) {
    console.error('Usage: node script.js <componentId> [outputPath]');
    process.exit(1);
  }

  if (outputPath) {
    await renderer.renderByIdToFile(componentId, outputPath);
  } else {
    await renderer.printById(componentId);
  }
}
