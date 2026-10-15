---
'@dweber019/backstage-plugin-tips': patch
---

Annotate `tipsConfigRef` with `ApiRef` from `@backstage/core-plugin-api` so the published type definitions no longer import the undeclared `@backstage/frontend-plugin-api`.
