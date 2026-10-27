---
title: Limits
description: What the runtime does not do, and behaviour worth knowing before you rely on it.
order: 2
---

- **HTML only.** No PDF or PNG output, no CSS inlining for email, no server or router. The channels
  `pdf` and `og` are context labels.
- **Experimental Astro API.** Rendering goes through `experimental_AstroContainer`. Astro may
  change it; the package declares `astro >= 4.0.0` as a peer dependency, and the repository itself
  is developed against Astro 6.
- **Scoped styles.** A rendered string contains the component's markup with Astro's
  `data-astro-cid-*` attributes, not its `<style>` block. Use the `styles` field of a registry
  entry, or a stylesheet on the page that receives the fragment.
- **Context as a prop.** The context reaches components as `Astro.props.__context`. It is not
  available as `Astro.locals` or through any other Astro mechanism.
- **`renderToResponse` has no context parameter.** Use `baseContext` or `renderComponent`.
- **Shared component cache.** Loaded registry components are cached by ID in a module-level map,
  across runtime instances. Re-registering an ID with a different loader after its first render
  keeps serving the first component.
- **Services are singletons per runtime.** The factory runs once per name until the name is
  registered again.
- **Error matching by message.** Adapters answer 404 when the error message contains `not found`.
- **Presets store options, not behaviour.** The email preset's `provider` and `inlineStyles`, and
  the AHA preset's `htmxHeaders`, are written to the context; the preset code does not act on them.
- **No benchmarks.** The repository contains unit tests with a mocked container
  (`src/runtime.test.ts`) and example projects, but no performance measurements.
