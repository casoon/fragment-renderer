import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type { ComponentLoader, RegistryEntry } from '../types.js';

/**
 * Cache for resolved components
 */
const componentCache = new Map<string, AstroComponentFactory>();

/**
 * Resolve a component from a loader function
 * Uses caching to avoid re-importing the same component
 */
export async function resolveComponent(
  entry: RegistryEntry
): Promise<AstroComponentFactory> {
  const cached = componentCache.get(entry.id);
  if (cached) {
    return cached;
  }

  const module = await entry.loader();
  const component = module.default;

  if (!component) {
    throw new Error(`Component "${entry.id}" does not have a default export`);
  }

  componentCache.set(entry.id, component);
  return component;
}

/**
 * Clear the component cache
 */
export function clearComponentCache(): void {
  componentCache.clear();
}

/**
 * Remove a specific component from the cache
 */
export function removeFromCache(id: string): boolean {
  return componentCache.delete(id);
}

/**
 * Check if a component is cached
 */
export function isCached(id: string): boolean {
  return componentCache.has(id);
}
