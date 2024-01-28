import { apiDocsModuleWsdlApiRef, ApiDocsModuleWsdlClient } from './api';
import {
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

/**
 * The plugin instance.
 *
 * @public
 */
export const apiDocsModuleWsdlDocPlugin = createPlugin({
  id: 'api-docs-module-wsdl',
  apis: [
    createApiFactory({
      api: apiDocsModuleWsdlApiRef,
      deps: {
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory({ identityApi, discoveryApi }) {
        return new ApiDocsModuleWsdlClient({ identityApi, discoveryApi });
      },
    }),
  ],
});
