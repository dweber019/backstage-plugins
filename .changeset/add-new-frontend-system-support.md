---
'@dweber019/backstage-plugin-api-docs-spectral-linter': minor
---

Added support for the new frontend system.

A new `/alpha` entry point is now available that exports the plugin as a default export compatible with `createFrontendPlugin`. This includes:

- `ApiBlueprint` for the Spectral Linter API
- `EntityContentBlueprint` for the Spectral Linter tab on API entity pages
- Entity filter that automatically shows the tab only on `openapi` and `asyncapi` API entities

The existing entry point (`/`) remains unchanged for backward compatibility.
