import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { endOfLifeApiRef, EndOfLifeClient } from './api';
import { isEndOfLifeAvailable } from './conditions';

/**
 * Provides the end of life API as an extension.
 * @alpha
 */
const endOfLifeApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: endOfLifeApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, identityApi, configApi }) =>
        new EndOfLifeClient({
          baseUrl:
            configApi.getOptionalString('endOfLife.baseUrl') ??
            'https://endoflife.date',
          discoveryApi,
          fetchApi,
          identityApi,
        }),
    }),
});

/**
 * Entity card that renders the end of life timeline, on entities carrying one
 * of the end of life annotations.
 * @alpha
 */
const endOfLifeCard = EntityCardBlueprint.make({
  params: {
    type: 'content',
    filter: isEndOfLifeAvailable,
    loader: () =>
      import('./components/EntityEndOfLifeCard').then(m => (
        <m.EntityEndOfLifeCard />
      )),
  },
});

/**
 * Entity content that renders the end of life timeline on a tab of its own.
 *
 * Disabled by default, since the card above already covers the setup described
 * in the plugin README. Apps that prefer a dedicated tab enable it through
 * `app.extensions`.
 * @alpha
 */
const endOfLifeContent = EntityContentBlueprint.make({
  disabled: true,
  params: {
    path: '/endoflife',
    title: 'End of life',
    filter: isEndOfLifeAvailable,
    loader: () =>
      import('./components/EntityEndOfLifeCard').then(m => (
        <m.EntityEndOfLifeCard />
      )),
  },
});

/**
 * The end of life plugin, for use with the new frontend system.
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'endoflife',
  extensions: [endOfLifeApi, endOfLifeCard, endOfLifeContent],
});
