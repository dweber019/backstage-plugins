import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 *
 * @public
 */
export const apiDocsModuleWsdlPlugin = createBackendPlugin({
  pluginId: 'api-docs-module-wsdl',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        discovery: coreServices.discovery,
      },
      async init({ logger, httpRouter, discovery }) {
        httpRouter.use(
          await createRouter({
            logger: loggerToWinstonLogger(logger),
            discovery,
          }),
        );
      },
    });
  },
});
