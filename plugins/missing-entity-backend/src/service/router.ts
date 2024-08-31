import { createLegacyAuthAdapters } from '@backstage/backend-common';
import {
  DatabaseService,
  DiscoveryService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { MissingEntityBackendApi } from '../api';
import { MissingEntityBackendDatabase } from '../db';
import { HumanDuration, JsonObject } from '@backstage/types';
import { CatalogClient } from '@backstage/catalog-client';
import { MissingEntityBackendClient } from '../api/MissingEntityBackendClient';
import { Config } from '@backstage/config';
import {
  AuthService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { NotificationService } from '@backstage/plugin-notifications-node';

/** @public */
export interface PluginOptions {
  schedule?: SchedulerServiceTaskScheduleDefinition;
  age?: HumanDuration;
  batchSize?: number;
  kindAndType?: { kind: string, type?: string }[];
  excludeKindAndType?: { kind: string, type?: string }[];
}

/** @public */
export interface RouterOptions {
  missingEntityBackendApi?: MissingEntityBackendApi;
  logger: LoggerService;
  database: DatabaseService;
  discovery: DiscoveryService;
  config: Config;
  scheduler?: SchedulerService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
  notification: NotificationService;
}

/** @public */
export async function createRouter(
  pluginOptions: PluginOptions,
  routerOptions: RouterOptions,
): Promise<express.Router> {
  const { logger, database, discovery, scheduler, auth, config, notification } =
    routerOptions;

  const {
    schedule,
    age,
    batchSize,
    kindAndType,
    excludeKindAndType,
  } = pluginOptions;

  const missingEntityBackendStore = await MissingEntityBackendDatabase.create(
    await database.getClient(),
  );

  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const { auth: adaptedAuth } = createLegacyAuthAdapters({
    auth,
    discovery: discovery,
  });

  const missingEntityBackendClient =
    routerOptions.missingEntityBackendApi ||
    new MissingEntityBackendClient(
      logger,
      missingEntityBackendStore,
      adaptedAuth,
      catalogClient,
      notification,
      age,
      batchSize,
      kindAndType,
      excludeKindAndType,
    );

  if (scheduler && schedule) {
    logger.info(
      `Scheduling processing of entities with: ${JSON.stringify(schedule)}`,
    );
    await scheduler.scheduleTask({
      id: 'missing_entity_process_entities',
      frequency: schedule.frequency,
      timeout: schedule.timeout,
      initialDelay: schedule.initialDelay,
      scope: schedule.scope,
      fn: async () => {
        await missingEntityBackendClient.processEntities();
      },
    });
  }

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' });
  });

  /**
   * /entity?entity=component:default/my-component&refresh=true
   */
  router.get('/entity', async (req, res) => {
    const { entityRef: entityRef, refresh: refresh } = req.query;

    if (!entityRef) {
      throw new Error('No entityRef was provided');
    }

    const missingEntities = await missingEntityBackendClient.getMissingEntities(
      entityRef as string,
      (refresh === 'true')
    );
    res.status(200).json(missingEntities);
  });

  /**
   * /entities?onlyWithMissing=true
   */
  router.get('/entities', async (req, res) => {
    const { onlyWithMissing: onlyWithMissing, owner: owner } = req.query;

    const missingEntities = await missingEntityBackendClient.getAllMissingEntities(
      onlyWithMissing === undefined ? true : (onlyWithMissing === 'true'),
      owner as string | undefined,
    );
    res.status(200).json(missingEntities);
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

/** @public */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  const { config } = routerOptions;
  const pluginOptions: PluginOptions = {};
  if (config) {
    if (config.has('missingEntity.schedule')) {
      pluginOptions.schedule =
        readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('missingEntity.schedule'),
        );
    }
    pluginOptions.batchSize = config.getOptionalNumber('missingEntity.batchSize');
    pluginOptions.age = config.getOptional<JsonObject>('missingEntity.age') as
      | HumanDuration
      | undefined;
    pluginOptions.kindAndType = config.getOptionalConfigArray('missingEntity.kindAndType')?.map(kindAndTypeConfig => {
      return {
        kind: kindAndTypeConfig.getString('kind'),
        type: kindAndTypeConfig.getOptionalString('type'),
      };
    });
    pluginOptions.excludeKindAndType = config.getOptionalConfigArray('missingEntity.excludeKindAndType')?.map(kindAndTypeConfig => {
      return {
        kind: kindAndTypeConfig.getString('kind'),
        type: kindAndTypeConfig.getOptionalString('type'),
      };
    });
  }
  return createRouter(pluginOptions, routerOptions);
}
