// Main entry point for @skibidoo/container-runtime

export { createAstroRuntime } from './runtime.js';

// Re-export all types
export type {
  AstroRuntime,
  ComponentLoader,
  Preset,
  PresetConfig,
  RegistryEntry,
  RenderByIdOptions,
  RenderContext,
  RenderOptions,
  ResponseOptions,
  RuntimeConfig,
  ServiceDefinition,
} from './types.js';
