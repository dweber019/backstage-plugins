# # End of life Plugin Backend

This backend plugin provides an endpoint for getting source files used in the [End of Life frontend plugin](../endoflife/README.md).

## Install

## Setup your `integrations` config

First you'll need to setup your `integrations` config inside your `app-config.yaml`. You can skip this step if it's already setup, and if you need help configuring this you can read the [integrations documentation](https://backstage.io/docs/integrations/)

### Setup plugin

First we need to add the `@dweber019/backstage-plugin-endoflife-backend` package:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @dweber019/backstage-plugin-endoflife-backend
```

Then we will create a new file named `packages/backend/src/plugins/endoflife.ts`, and add the following to it:

```ts
import { createRouter } from '@dweber019/backstage-plugin-endoflife-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    reader: env.reader,
    cacheClient: env.cache.getClient(),
    logger: env.logger,
  });
}
```

Next we wire this into the overall backend router, edit `packages/backend/src/index.ts`:

```ts
import endOfLife from './plugins/endoflife';
// ...
async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const endOfLifeEnv = useHotMemoize(module, () => createEnv('endoflife'));
  // ...
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/endoflife', await endOfLife(endOfLifeEnv));
```

### New Backend System

The backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```ts
const backend = createBackend();

backend.add(import('@dweber019/backstage-plugin-endoflife-backend'));

// ... other feature additions

backend.start();
```

## Local development

There is a local setup at `plugins/endoflife-backend/dev` which can be started with `yarn --cwd plugins/endoflife-backend start` from the root.
