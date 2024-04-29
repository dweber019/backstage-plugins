import {
  DatabaseManager,
  loggerToWinstonLogger,
} from '@backstage/backend-common';
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
        identity: coreServices.identity,
        httpRouter: coreServices.httpRouter,
      },
      async init({ logger, config, database, identity, httpRouter }) {
        httpRouter.use(
          await createRouterFromConfig({
            logger: loggerToWinstonLogger(logger),
            config,
            database,
            identity,
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
      },
      async init({ catalog, logger, config }) {
        const databaseManager = DatabaseManager.fromConfig(config);
        const databaseService = databaseManager.forPlugin('accentuate');
        catalog.addProcessor(
          await AccentuateEntitiesProcessor.fromEnv({
            logger: loggerToWinstonLogger(logger),
            config,
            database: databaseService,
          }),
        );
      },
    });
  },
});
