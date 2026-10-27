---
title: Runtime API
description: Methods of the object returned by createAstroRuntime, and the types it uses.
order: 1
---

```ts
createAstroRuntime(config?: RuntimeConfig): AstroRuntime
```

`RuntimeConfig`:

| Field | Type | Purpose |
| --- | --- | --- |
| `baseContext` | `RenderContext` | Context for every render. Default `{ locale: undefined, channel: 'web' }` |
| `components` | `RegistryEntry[]` | Components registered at creation |
| `services` | `ServiceDefinition[]` | `{ name, factory }` pairs registered at creation |

## Rendering

| Method | Returns |
| --- | --- |
| `renderComponent(component, props?, context?)` | `Promise<string>` |
| `renderToResponse(component, props?, { status, headers, contentType }?)` | `Promise<Response>` |
| `renderToString({ componentId, props?, context?, slots? })` | `Promise<string>`, styles of the entry prepended as `<style>` |

## Registry

`registerComponent`, `registerComponents`, `hasComponent`, `getComponent`, `listComponents`,
`unregisterComponent`. See [Registry and services](../../guides/registry-and-services/).

## Context and services

| Method | Purpose |
| --- | --- |
| `setBaseContext(context)` | Replaces the base context; throws if it is not an object |
| `getBaseContext()` | A copy of the current base context |
| `registerService(name, factory)`, `getService(name)`, `hasService(name)` | Services with cached instances |

## Types

All of these are exported from the package root: `AstroRuntime`, `RuntimeConfig`, `RenderContext`,
`RenderOptions`, `RenderByIdOptions`, `ResponseOptions`, `RegistryEntry`, `ComponentLoader`,
`ComponentMeta`, `ComponentFilter`, `ServiceDefinition`, `Preset`, `PresetConfig`.

Item-level documentation is in the TypeScript declarations and the JSDoc comments of the
[source](https://github.com/casoon/fragment-renderer/tree/main/src).
