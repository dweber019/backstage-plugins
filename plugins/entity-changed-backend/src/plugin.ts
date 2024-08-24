import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { EntityChangedProcessor } from './processor';
import { eventsServiceRef } from '@backstage/plugin-events-node';

export const catalogModuleEntityChangedProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'entity-changed-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        events: eventsServiceRef,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ catalog, logger, config, events, discovery, auth }) {
        catalog.addProcessor(
          EntityChangedProcessor.fromConfig({
            logger,
            config,
            events,
            discovery,
            auth,
          }),
        );
      },
    });
  },
});
