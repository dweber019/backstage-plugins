---
'@dweber019/backstage-plugin-endoflife': minor
---

Added support for the new frontend system.

A new `/alpha` entry point is now available that exports the plugin as a default export compatible with `createFrontendPlugin`. This includes:

- `ApiBlueprint` for the End of Life API
- `EntityCardBlueprint` for the End of Life card, filtered to entities carrying one of the end of life annotations
- `EntityContentBlueprint` for an optional End of Life tab, disabled by default

The existing entry point (`/`) remains unchanged for backward compatibility.
