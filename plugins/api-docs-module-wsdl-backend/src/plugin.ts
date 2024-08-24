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
        tokenManager: coreServices.tokenManager,
        auth: coreServices.auth,
      },
      async init({ logger, httpRouter, discovery, tokenManager, auth }) {
        httpRouter.use(
          await createRouter({
            logger,
            discovery,
            tokenManager,
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
