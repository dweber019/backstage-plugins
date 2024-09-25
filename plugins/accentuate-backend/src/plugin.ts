import {
  coreServices,
  createBackendPlugin,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { createRouterFromConfig } from './service/router';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { AccentuateEntitiesProcessor } from './processor';

/**
 * @public
 */
export const accentuatePlugin = createBackendPlugin({
  pluginId: 'accentuate',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        userInfo: coreServices.userInfo,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
      },
      async init({ logger, config, database, httpAuth, httpRouter, userInfo }) {
        httpRouter.use(
          await createRouterFromConfig({
            logger,
            config,
            database,
            userInfo,
            httpAuth,
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

export const catalogModuleAccentuateProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'accentuate-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ catalog, logger, config, discovery, auth }) {
        catalog.addProcessor(
          await AccentuateEntitiesProcessor.fromEnv({
            logger,
            config,
            discovery,
            auth
          }),
        );
      },
    });
  },
});
