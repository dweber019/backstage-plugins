import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { tipsConfigRef } from './config';
import { systemModelTips } from './lib/systemModelTips';
import { extraTips } from './lib/extraTips';

/** @public */
export const tipsPlugin = createPlugin({
  id: 'tips',
  apis: [
    createApiFactory({
      api: tipsConfigRef,
      deps: {},
      factory() {
        return {
          tips: [...systemModelTips, ...extraTips],
        };
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
export const EntityTipsDialog = tipsPlugin.provide(
  createRoutableExtension({
    name: 'EntityTipsDialog',
    component: () =>
      import('./components/EntityTipsDialog').then(m => m.EntityTipsDialog),
    mountPoint: rootRouteRef,
  }),
);
