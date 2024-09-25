import {
  configApiRef,
  createApiFactory,
  createPlugin, createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { kongGatewayApiRef } from './api';
import { rootRouteRef } from './routes';
import { KongGatewayClientsFactory } from './api/KongGatewayClientsFactory';

/** @public */
export const kongGatewayPlugin = createPlugin({
  id: 'kong-gateway',
  apis: [
    createApiFactory({
      api: kongGatewayApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        KongGatewayClientsFactory.fromConfig({ discoveryApi, fetchApi, configApi }),
    }),
  ],
});

export const KongGatewayPage = kongGatewayPlugin.provide(
  createRoutableExtension({
    name: 'KongGatewayPage',
    component: () =>
      import('./components/KongGatewayPage').then(m => m.KongGatewayPage),
    mountPoint: rootRouteRef,
  }),
);

// export const KongGatewayContent = kongGatewayPlugin.provide(
//   createRoutableExtension({
//     name: 'KongGatewayContent',
//     component: () =>
//       import('./components/KongGatewayContent').then(m => m.KongGatewayContent),
//     mountPoint: rootRouteRef,
//   }),
// );
