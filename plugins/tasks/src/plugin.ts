import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { tasksApiRef, TasksClient } from './api';
import { rootRouteRef } from './routes';

/** @public */
export const tasksPlugin = createPlugin({
  id: 'tasks',
  apis: [
    createApiFactory({
      api: tasksApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory: ({ discoveryApi, identityApi }) =>
        new TasksClient({ discoveryApi, identityApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/** @public */
export const EntityTasksCard = tasksPlugin.provide(
  createComponentExtension({
    name: 'EntityTasksCard',
    component: {
      lazy: () => import('./components/TasksCard').then(m => m.TasksCard),
    },
  }),
);

/** @public */
export const TasksPage = tasksPlugin.provide(
  createRoutableExtension({
    name: 'TasksPage',
    component: () => import('./components/TasksPage').then(m => m.TasksPage),
    mountPoint: rootRouteRef,
  }),
);
