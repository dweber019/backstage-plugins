import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { endOfLifeApiRef, EndOfLifeClient } from './api';

/** @public */
export const endOfLifePlugin = createPlugin({
  id: 'endoflife',
  apis: [
    createApiFactory({
      api: endOfLifeApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory({ discoveryApi, fetchApi, identityApi }) {
        return new EndOfLifeClient({
          baseUrl: 'https://endoflife.date',
          discoveryApi,
          fetchApi,
          identityApi,
        });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * An extension
 * @public
 */
export const EntityEndOfLifeCard = endOfLifePlugin.provide(
  createRoutableExtension({
    name: 'EntityEndOfLifeCard',
    component: () =>
      import('./components/EntityEndOfLifeCard').then(
        m => m.EntityEndOfLifeCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
