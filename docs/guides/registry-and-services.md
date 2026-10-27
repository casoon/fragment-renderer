---
title: Registry and services
description: Render components by ID, filter them, and share cached services.
order: 1
---

## Registry

```ts
runtime.registerComponent(
  'hero',
  () => import('./Hero.astro'),
  { category: 'layout', tags: ['marketing'], description: 'Page hero' },
  '.hero { padding: 4rem }', // optional styles
);

runtime.registerComponents([
  { id: 'ui-button', loader: () => import('./Button.astro') },
  { id: 'ui-input', loader: () => import('./Input.astro'), meta: { category: 'form' } },
]);
```

| Method | Purpose |
| --- | --- |
| `registerComponent(id, loader, meta?, styles?)` | Add or replace one entry. `id` must be a non-empty string, `loader` a function. |
| `registerComponents(entries)` | Bulk registration with `RegistryEntry[]`. |
| `hasComponent(id)`, `getComponent(id)` | Look up an entry. |
| `listComponents(filter?)` | All entries, or filtered by `category`, `tag`, `tags` (all must match) and `predicate`. |
| `unregisterComponent(id)` | Returns `true` if the entry existed. |
| `renderToString({ componentId, props?, context?, slots? })` | Render by ID. Throws `Component "<id>" not found in registry` for unknown IDs. |

A `RegistryEntry` can also be passed in `createAstroRuntime({ components })`.

### Styles

If an entry has `styles`, `renderToString` prepends `<style>…</style>` to the output. Use it when
a fragment is inserted into a page that does not already load the component's CSS. Without it, the
string contains the markup only; scoped component styles are not part of it.

### Slots

`slots` maps slot names to a string or an Astro component factory:

```ts
await runtime.renderToString({
  componentId: 'card',
  props: { title: 'Hello' },
  slots: { default: '<p>Body</p>' },
});
```

### Resolution cache

Loaded components are cached by ID in a module-level map shared by all runtimes in the process.
Registering another loader under an ID that was already rendered does not replace the cached
component. See [Limits](../../reference/limits/).

## Services

A service is a named factory that receives the runtime. `getService` runs the factory once and
returns the same instance afterwards.

```ts
runtime.registerService('analytics', (rt) => ({
  track: (event: string) => console.log(event, rt.getBaseContext().locale),
}));

const analytics = await runtime.getService<{ track(e: string): void }>('analytics');
```

Factories may be async. `getService` throws `Service "<name>" not registered` for unknown names.
Registering a name again drops the cached instance. `hasService(name)` checks registration.
