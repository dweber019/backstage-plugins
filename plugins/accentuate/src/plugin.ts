import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { accentuateApiRef, AccentuateClient } from './api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { schemas } from './schemas';
import { rootRouteRef } from './routes';

/** @public */
export const accentuatePlugin = createPlugin({
  id: 'accentuate',
  apis: [
    createApiFactory({
      api: accentuateApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
        catalogApi: catalogApiRef,
      },
      factory({ discoveryApi, fetchApi, identityApi, catalogApi }) {
        return new AccentuateClient({
          discoveryApi,
          fetchApi,
          identityApi,
          catalogApi,
          schemas,
        });
      },
    }),
  ],
});

/**
 * @public
 */
export const EntityAccentuateInfo = accentuatePlugin.provide(
  createComponentExtension({
    name: 'EntityAccentuateInfo',
    component: {
      lazy: () =>
        import('./components/EntityAccentuateInfo').then(
          m => m.EntityAccentuateInfo,
        ),
    },
  }),
);

export const AccentuatePage = accentuatePlugin.provide(
  createRoutableExtension({
    name: 'AccentuatePage',
    component: () =>
      import('./components/AccentuatePage').then(m => m.AccentuatePage),
    mountPoint: rootRouteRef,
  }),
);
