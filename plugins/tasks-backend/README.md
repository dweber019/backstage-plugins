# Tasks Backend

## Setup

The following sections will help you get the Tasks Backend plugin setup and running.

### Up and Running

Here's how to get the backend up and running:

1. First we need to add the `@dweber019/backstage-plugin-tasks-backend` package to your backend:

   ```sh
   # From the Backstage root directory
   yarn --cwd packages/backend add @dweber019/backstage-plugin-tasks-backend
   ```

2. Then we will create a new file named `packages/backend/src/plugins/tasks.ts`, and add the
   following to it:

   ```ts
   import { createRouter } from '@dweber019/backstage-plugin-tasks-backend';
   import { Router } from 'express';
   import type { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     return createRouter({ ...env });
   }
   ```

3. Next we wire this into the overall backend router, edit `packages/backend/src/index.ts`:

   ```ts
   import tasks from './plugins/tasks';
   // ...
   async function main() {
     // ...
     // Add this line under the other lines that follow the useHotMemoize pattern
     const tasksEnv = useHotMemoize(module, () => createEnv('tasks'));
     // ...
     // Insert this line under the other lines that add their routers to apiRouter in the same way
     apiRouter.use('/tasks', await tasks(tasksEnv));
   ```

4. Now run `yarn start-backend` from the repo root

#### New Backend System

The Tasks backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
+ import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@dweber019/backstage-plugin-tasks-backend'));

  backend.start();
```
