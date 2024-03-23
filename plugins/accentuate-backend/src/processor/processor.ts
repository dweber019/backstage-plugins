import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import {
  Entity,
  entityKindSchemaValidator,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { Logger } from 'winston';
import * as schema from './Accentuate.v1alpha1.schema.json';
import { AccentuateBackendDatabase } from '../db';
import { AccentuateBackendClient } from '../api';
import deepmerge from 'deepmerge';
import { PluginDatabaseManager } from '@backstage/backend-common';
import {
  ANNOTATION_ACCENTUATE_DISABLE,
  DEFAULT_ALLOWED_KINDS,
} from '@dweber019/backstage-plugin-accentuate-common';
import { Config } from '@backstage/config';

export type PluginEnvironment = {
  logger: Logger;
  config: Config;
  database: PluginDatabaseManager;
};

export class AccentuateEntitiesProcessor implements CatalogProcessor {
  private readonly logger: Logger;
  private readonly config: Config;
  private readonly accentuateBackendClient: AccentuateBackendClient;

  constructor(options: {
    logger: Logger;
    config: Config;
    accentuateBackendClient: AccentuateBackendClient;
  }) {
    this.logger = options.logger.child({
      type: 'processor',
      processor: this.getProcessorName(),
    });
    this.config = options.config;
    this.accentuateBackendClient = options.accentuateBackendClient;
  }

  getProcessorName(): string {
    return 'AccentuateEntitiesProcessor';
  }
  async validateEntityKind(entity: Entity): Promise<boolean> {
    const validator = entityKindSchemaValidator(schema);
    return !!validator(entity);
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    const allowedKinds =
      this.config.getOptionalStringArray('accentuate.allowedKinds') ??
      DEFAULT_ALLOWED_KINDS;
    if (!allowedKinds.includes(entity.kind)) {
      return deepmerge(entity, {
        metadata: { annotations: { [ANNOTATION_ACCENTUATE_DISABLE]: 'true' } },
      }) as any;
    }

    const accentuate = await this.accentuateBackendClient.get(
      stringifyEntityRef(entity),
    );
    this.logger.debug('Does accentuate for entity exists', {
      entity: stringifyEntityRef(entity),
      exists: !!accentuate,
    });
    if (accentuate !== undefined) {
      return deepmerge(entity, accentuate.data) as any;
    }

    return entity;
  }

  public static async fromEnv(env: PluginEnvironment) {
    const tasksBackendStore = await AccentuateBackendDatabase.create(
      await env.database.getClient(),
    );
    const accentuateBackendClient = new AccentuateBackendClient(
      env.logger,
      tasksBackendStore,
    );
    return new AccentuateEntitiesProcessor({
      logger: env.logger,
      config: env.config,
      accentuateBackendClient,
    });
  }
}
