import type { AstroComponentFactory } from "astro/runtime/server/index.js";

/**
 * Render context for component rendering
 */
export interface RenderContext {
  /** Locale for i18n (e.g., 'de', 'en-US') */
  locale?: string;
  /** Render channel (e.g., 'web', 'email', 'pdf') */
  channel?: "web" | "email" | "pdf" | "og" | "widget" | string;
  /** Custom context data */
  [key: string]: unknown;
}

/**
 * Options for rendering a component
 */
export interface RenderOptions {
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Render context */
  context?: RenderContext;
  /** Slots to pass to the component */
  slots?: Record<string, string | AstroComponentFactory>;
}

/**
 * Options for creating a Response
 */
export interface ResponseOptions {
  /** HTTP status code */
  status?: number;
  /** HTTP headers */
  headers?: HeadersInit;
  /** Content-Type header (default: 'text/html; charset=utf-8') */
  contentType?: string;
}

/**
 * Component loader function type
 */
export type ComponentLoader = () => Promise<{ default: AstroComponentFactory }>;

/**
 * Registry entry for a component
 */
export interface RegistryEntry {
  /** Component ID */
  id: string;
  /** Loader function */
  loader: ComponentLoader;
  /** Optional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Service definition
 */
export interface ServiceDefinition<T = unknown> {
  /** Service name */
  name: string;
  /** Service factory function */
  factory: (runtime: AstroRuntime) => T | Promise<T>;
}

/**
 * Runtime configuration
 */
export interface RuntimeConfig {
  /** Base context applied to all renders */
  baseContext?: RenderContext;
  /** Pre-registered components */
  components?: RegistryEntry[];
  /** Pre-registered services */
  services?: ServiceDefinition[];
}

/**
 * Render result with component ID
 */
export interface RenderByIdOptions {
  /** Component ID from registry */
  componentId: string;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  /** Render context */
  context?: RenderContext;
  /** Slots to pass to the component */
  slots?: Record<string, string | AstroComponentFactory>;
}

/**
 * Main AstroRuntime interface
 */
export interface AstroRuntime {
  // ─────────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────────

  /**
   * Render a component to HTML string
   */
  renderComponent(
    component: AstroComponentFactory,
    props?: Record<string, unknown>,
    context?: RenderContext,
  ): Promise<string>;

  /**
   * Render a component to a Response object
   */
  renderToResponse(
    component: AstroComponentFactory,
    props?: Record<string, unknown>,
    options?: ResponseOptions,
  ): Promise<Response>;

  // ─────────────────────────────────────────────────────────────────
  // Registry
  // ─────────────────────────────────────────────────────────────────

  /**
   * Register a component in the registry
   */
  registerComponent(
    id: string,
    loader: ComponentLoader,
    meta?: Record<string, unknown>,
  ): void;

  /**
   * Get a component from the registry
   */
  getComponent(id: string): RegistryEntry | undefined;

  /**
   * List all registered components
   */
  listComponents(): RegistryEntry[];

  /**
   * Render a component by ID
   */
  renderToString(options: RenderByIdOptions): Promise<string>;

  // ─────────────────────────────────────────────────────────────────
  // Context & Services
  // ─────────────────────────────────────────────────────────────────

  /**
   * Set the base context for all renders
   */
  setBaseContext(context: RenderContext): void;

  /**
   * Get the current base context
   */
  getBaseContext(): RenderContext;

  /**
   * Register a service
   */
  registerService<T>(
    name: string,
    factory: (runtime: AstroRuntime) => T | Promise<T>,
  ): void;

  /**
   * Get a registered service
   */
  getService<T>(name: string): Promise<T>;

  /**
   * Check if a service is registered
   */
  hasService(name: string): boolean;
}

/**
 * Preset configuration
 */
export interface PresetConfig {
  /** Base context to apply */
  baseContext?: RenderContext;
  /** Components to register */
  components?: RegistryEntry[];
  /** Services to register */
  services?: ServiceDefinition[];
  /** Custom configuration */
  [key: string]: unknown;
}

/**
 * Preset function type
 */
export type Preset = (config?: Record<string, unknown>) => PresetConfig;
