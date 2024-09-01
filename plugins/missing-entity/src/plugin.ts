import {
  createApiFactory,
  createPlugin, createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { missingEntityApiRef, MissingEntityClient } from './api';
import { rootRouteRef } from './routes';

/** @public */
export const missingEntityPlugin = createPlugin({
  id: 'missing-entity',
  apis: [
    createApiFactory({
      api: missingEntityApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new MissingEntityClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const MissingEntityPage = missingEntityPlugin.provide(
  createRoutableExtension({
    name: 'MissingEntity',
    component: () =>
      import('./components/MissingEntityPage').then(m => m.MissingEntityPage),
    mountPoint: rootRouteRef,
  }),
);

export const MissingEntityContent = missingEntityPlugin.provide(
  createRoutableExtension({
    name: 'MissingEntityContent',
    component: () =>
      import('./components/MissingEntityPage').then(m => m.MissingEntityContent),
    mountPoint: rootRouteRef,
  }),
);
