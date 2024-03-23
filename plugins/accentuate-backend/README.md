# Accentuate backend plugin

The accentuate backend plugin merges data stored in the database with the ingested entities mostly ingested from
SCM.

Additionally, the plugin will provide an API to manage the data for the [accentuate frontend plugin](../accentuate/README.md).

## Install

### Setup plugin

First we need to add the `@dweber019/backstage-plugin-accentuate-backend` package:

```sh
# From your Backstage root directory
yarn add --cwd packages/backend @dweber019/backstage-plugin-accentuate-backend
```

Then we open the file named `packages/backend/src/plugins/catalog.ts`, and extend it with:

```ts
import { AccentuateEntitiesProcessor } from '@dweber019/backstage-plugin-accentuate-backend';

export default async function createPlugin(
  env: PluginEnvironment,
  envAccentuate: PluginEnvironment, // required that the correct database is used in AccentuateEntitiesProcessor
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  builder.addProcessor(
    await AccentuateEntitiesProcessor.fromEnv(envAccentuate),
  );

  const { processingEngine, router } = await builder.build();
  // ..
}
```

Then create a file at `packages/backend/src/plugins/accentuate.ts` with

```ts
import { createRouter } from '@dweber019/backstage-plugin-accentuate-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
    identity: env.identity,
  });
}
```

Next we wire this into the overall backend router, edit `packages/backend/src/index.ts`:

```ts
import accentuate from './plugins/accentuate';
// ...
async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const accentuateEnv = useHotMemoize(module, () => createEnv('accentuate'));
  // ...
  // Extend the catalog to provide the accentuateEnv
  apiRouter.use('/catalog', await catalog(catalogEnv, accentuateEnv));
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/accentuate', await accentuate(accentuateEnv));
```

### New Backend System

The backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff

+ import { accentuatePlugin, catalogModuleAccentuateProcessor } from '@dweber019/backstage-plugin-accentuate-backend';
  const backend = createBackend();

+ backend.add(accentuatePlugin());
+ backend.add(catalogModuleAccentuateProcessor());

// ... other feature additions

  backend.start();
```

> This was not tested and is here for reference
