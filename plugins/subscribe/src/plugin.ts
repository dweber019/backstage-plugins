import {
  createApiFactory, createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { subscribeApiRef, SubscribeClient } from './api';

/**
 * The plugin instance.
 *
 * @public
 */
export const subscribePlugin = createPlugin({
  id: 'subscribe',
  apis: [
    createApiFactory({
      api: subscribeApiRef,
      deps: {
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory({ identityApi, discoveryApi }) {
        return new SubscribeClient({ identityApi, discoveryApi });
      },
    }),
  ],
});

/** @public */
export const EntitySubscribeDialog = subscribePlugin.provide(
  createComponentExtension({
    name: 'EntityBadgesDialog',
    component: {
      lazy: () =>
        import('./components/EntitySubscribeDialog/EntitySubscribeDialog').then(
          m => m.EntitySubscribeDialog,
        ),
    },
  }),
);
