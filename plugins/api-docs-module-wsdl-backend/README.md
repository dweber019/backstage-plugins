# @dweber019/backstage-plugin-api-docs-module-wsdl-doc-backend

Backend for the `@dweber019/backstage-plugin-api-docs-module-wsdl` frontend plugin. Assists in converting WSDL to HTML.

## Setup

```
yarn add --cwd packages/backend @dweber019/backstage-plugin-api-docs-module-wsdl-backend
```

Then integrate the plugin using the following default setup for `src/plugins/apiDocsModuleWsdl.ts`:

```ts
import { Router } from 'express';
import { createRouter } from '@dweber019/backstage-plugin-api-docs-module-wsdl-backend';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter(env);
}
```

And then add to `packages/backend/src/index.ts`:

```ts
// In packages/backend/src/index.ts
import apiDocsModuleWsdlDoc from './plugins/apiDocsModuleWsdl';
// ...
async function main() {
  // ...
  const apiDocsModuleWsdlDocEnv = useHotMemoize(module, () => createEnv('apiDocsModuleWsdl'));
  // ...
  apiRouter.use('/api-docs-module-wsdl', await apiDocsModuleWsdlDoc(apiDocsModuleWsdlDocEnv));
```

### New Backend System

The backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```ts
import { createBackend } from '@backstage/backend-defaults';

backend.add(import('@dweber019/backstage-plugin-api-docs-module-wsdl-backend'));

backend.start();
```

## Development

This plugin is based on the work of the [wsdl-viewer](https://github.com/tomi-vanek/wsdl-viewer) and uses
[SaxonJS](https://www.saxonica.com/saxon-js/index.xml) for the `XSLT` transformation.

If you like to future improve the `XSLT` you have to make changes to `./wsdl-viewer.xsl` and convert it to a `SEF` file.

```shell
xslt3 -t -xsl:./wsdl-viewer.xsl -export:./src/stylesheet.sef.json -nogo
```

## Local development

There is a local setup at `plugins/api-docs-module-wsdl-backend/dev` which can be started with `yarn --cwd plugins/api-docs-module-wsdl-backend start` from the root.
