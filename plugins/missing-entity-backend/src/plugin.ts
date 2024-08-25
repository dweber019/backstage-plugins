import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { notificationService } from '@backstage/plugin-notifications-node';
import { createRouterFromConfig } from './service/router';

/**
 * @public
 */
export const missingEntityPlugin = createBackendPlugin({
  pluginId: 'missing-entity',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        discovery: coreServices.discovery,
        scheduler: coreServices.scheduler,
        httpRouter: coreServices.httpRouter,
        notification: notificationService,
      },
      async init({
        auth,
        httpAuth,
        logger,
        config,
        database,
        discovery,
        scheduler,
        httpRouter,
        notification,
      }) {
        httpRouter.use(
          await createRouterFromConfig({
            auth,
            httpAuth,
            logger,
            config,
            database,
            discovery,
            scheduler,
            notification,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
