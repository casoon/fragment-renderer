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
  /** Optional metadata (category, tags, etc.) */
  meta?: ComponentMeta;
}

/**
 * Component metadata for categorization and filtering
 */
export interface ComponentMeta {
  /** Component category (e.g., 'form', 'layout', 'data') */
  category?: string;
  /** Tags for filtering (e.g., ['input', 'interactive']) */
  tags?: string[];
  /** Human-readable description */
  description?: string;
  /** Custom metadata */
  [key: string]: unknown;
}

/**
 * Filter options for listing components
 */
export interface ComponentFilter {
  /** Filter by category */
  category?: string;
  /** Filter by tag (component must have this tag) */
  tag?: string;
  /** Filter by multiple tags (component must have all tags) */
  tags?: string[];
  /** Custom filter function */
  predicate?: (entry: RegistryEntry) => boolean;
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
   * Register a single component in the registry
   */
  registerComponent(
    id: string,
    loader: ComponentLoader,
    meta?: ComponentMeta,
  ): void;

  /**
   * Register multiple components at once (bulk registration)
   * 
   * @example
   * runtime.registerComponents([
   *   { id: 'ui-button', loader: () => import('./Button.astro') },
   *   { id: 'ui-input', loader: () => import('./Input.astro') },
   * ]);
   */
  registerComponents(entries: RegistryEntry[]): void;

  /**
   * Check if a component is registered
   */
  hasComponent(id: string): boolean;

  /**
   * Get a component from the registry
   */
  getComponent(id: string): RegistryEntry | undefined;

  /**
   * List registered components, optionally filtered
   * 
   * @example
   * // All components
   * runtime.listComponents();
   * 
   * // By category
   * runtime.listComponents({ category: 'form' });
   * 
   * // By tag
   * runtime.listComponents({ tag: 'interactive' });
   */
  listComponents(filter?: ComponentFilter): RegistryEntry[];

  /**
   * Unregister a component from the registry
   * @returns true if component was removed, false if not found
   */
  unregisterComponent(id: string): boolean;

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
