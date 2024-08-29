import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import deepmerge from 'deepmerge';
import {
  ANNOTATION_ACCENTUATE_DISABLE,
  DEFAULT_ALLOWED_KINDS,
  isAllowedKind,
} from '@dweber019/backstage-plugin-accentuate-common';
import { Config } from '@backstage/config';
import { AuthService, DiscoveryService, LoggerService } from '@backstage/backend-plugin-api';
import { AccentuateResponse } from '../api/AccentuateBackendClient';

export type PluginEnvironment = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
};

export class AccentuateEntitiesProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly config: Config;
  private readonly discovery: DiscoveryService;
  private readonly auth: AuthService;

  constructor(options: {
    logger: LoggerService;
    config: Config;
    discovery: DiscoveryService;
    auth: AuthService;
  }) {
    this.logger = options.logger.child({
      type: 'processor',
      processor: this.getProcessorName(),
    });
    this.config = options.config;
    this.discovery = options.discovery;
    this.auth = options.auth;
  }

  getProcessorName(): string {
    return 'AccentuateEntitiesProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    const allowedKinds =
      this.config
        .getOptionalConfigArray('accentuate.allowedKinds')
        ?.map(config => ({
          kind: config.getString('kind'),
          specType: config.getOptionalString('specType'),
        })) ?? DEFAULT_ALLOWED_KINDS;
    if (!isAllowedKind(entity, allowedKinds)) {
      return deepmerge(entity, {
        metadata: { annotations: { [ANNOTATION_ACCENTUATE_DISABLE]: 'true' } },
      }) as any;
    }

    const baseUrl = await this.discovery.getBaseUrl('accentuate');
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'accentuate',
    });

    const response = await fetch(`${baseUrl}?entityRef=${stringifyEntityRef(entity)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 404) {
      return entity;
    }
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const accentuate = await response.json() as AccentuateResponse;

    this.logger.info('Does accentuate for entity exists', {
      entity: stringifyEntityRef(entity),
      exists: !!accentuate,
    });
    if (accentuate !== undefined) {
      return deepmerge(entity, accentuate.data) as any;
    }

    return entity;
  }

  public static async fromEnv(env: PluginEnvironment) {
    return new AccentuateEntitiesProcessor({
      logger: env.logger,
      config: env.config,
      discovery: env.discovery,
      auth: env.auth,
    });
  }
}
