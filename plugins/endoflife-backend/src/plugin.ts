import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service';

/**
 * End of life backend plugin
 *
 * @public
 */
export const endOfLifePlugin = createBackendPlugin({
  pluginId: 'endoflife',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        reader: coreServices.urlReader,
        cache: coreServices.cache,
        httpRouter: coreServices.httpRouter,
      },
      async init({ httpRouter, logger, reader, cache }) {
        httpRouter.use(
          await createRouter({
            logger: loggerToWinstonLogger(logger),
            reader,
            cacheClient: cache,
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
