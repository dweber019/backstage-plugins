import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouterFromConfig } from './service/router';

/**
 * Tasks backend plugin
 *
 * @public
 */
export const tasksPlugin = createBackendPlugin({
  pluginId: 'tasks',
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
      },
    });
  },
});
