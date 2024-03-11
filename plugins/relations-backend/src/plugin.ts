import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { RelationEntitiesProcessor } from './processor';

export const catalogModuleRelationsProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'relations-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ catalog, logger, config }) {
        catalog.addProcessor(
          RelationEntitiesProcessor.fromConfig({
            logger: loggerToWinstonLogger(logger),
            config,
          }),
        );
      },
    });
  },
});
