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
        auth: coreServices.auth,
      },
      async init({ logger, httpRouter, discovery, auth }) {
        httpRouter.use(
          await createRouter({
            logger,
            discovery,
            auth,
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
