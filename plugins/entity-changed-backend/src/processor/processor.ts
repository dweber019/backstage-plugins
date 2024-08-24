import {
  CatalogProcessor,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  ApiEntity,
  ComponentEntity,
  Entity, getCompoundEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { EventsService } from '@backstage/plugin-events-node';
import { AuthService, DiscoveryService, LoggerService } from '@backstage/backend-plugin-api';
import { createHash } from 'crypto';
import { CatalogClient } from '@backstage/catalog-client';
import { cloneDeep, has, unset } from 'lodash';

export class EntityChangedProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly events: EventsService;
  private readonly catalogClient: CatalogClient;
  private readonly auth: AuthService;
  private readonly ignoreAttributes: string[];

  constructor(options: { logger: LoggerService; events: EventsService, discovery: DiscoveryService, auth: AuthService, config: Config }) {
    this.logger = options.logger.child({
      type: 'processor',
      processor: this.getProcessorName(),
    });
    this.events = options.events;
    this.catalogClient = new CatalogClient({ discoveryApi: options.discovery });
    this.auth = options.auth;
    this.ignoreAttributes = options.config.getOptionalStringArray('entityChangedProcessor.ignoreAttribute') || [];
  }

  getProcessorName(): string {
    return 'EntityChangedProcessor';
  }
  async validateEntityKind(_: Entity): Promise<boolean> {
    return true;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if ('location' === entity.kind.toLowerCase()) {
      return entity;
    }

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const entityResponse = await this.catalogClient.getEntityByRef(getCompoundEntityRef(entity), { token });
    const hashOfEntityInCatalog = entityResponse && this.getEntityAnnotationHash(entityResponse) || undefined;
    this.logger.info('Fetched entity', {
      entity: stringifyEntityRef(entity),
      found: !!entityResponse,
      hash: hashOfEntityInCatalog,
    });

    const hashOfEntity = this.getEntityHash(entity);
    this.logger.info('Processor entity', {
      entity: stringifyEntityRef(entity),
      hash: hashOfEntity,
    });

    if (hashOfEntityInCatalog === undefined) {
      this.logger.info('Entity is new', {
        entity: stringifyEntityRef(entity),
        hash: hashOfEntity,
      });
    }
    if (hashOfEntityInCatalog !== hashOfEntity) {
      entity.metadata.annotations = { ...entity.metadata.annotations, ...{
       [`backstage.io/entity-hash`]: hashOfEntity,
      }};
      if (hashOfEntityInCatalog !== undefined) {
        this.logger.info('Entity hash changed', {
          entity: stringifyEntityRef(entity),
          hash: hashOfEntity,
        });
        await this.events.publish({
          topic: 'entityChanged',
          eventPayload: {
            aspect: 'entity',
            entityRef: stringifyEntityRef(entity),
          }
        });
      }
    }

    await this.lifecycleChanged(entity, entityResponse);
    await this.ownerChanged(entity, entityResponse);
    await this.systemChanged(entity, entityResponse);
    await this.definitionChanged(entity, entityResponse);

    return entity;
  }

  private async lifecycleChanged(entity: Entity, entityCatalog: Entity | undefined) {
    if (['api', 'component',].includes(entity.kind.toLowerCase())) {
      const entityUndercheck = (entity as ComponentEntity | ApiEntity);
      if (
        entityUndercheck.spec.lifecycle
        && entityCatalog && (entityCatalog as ComponentEntity | ApiEntity).spec.lifecycle
        && entityUndercheck.spec.lifecycle.toLowerCase() !== (entityCatalog as ComponentEntity | ApiEntity).spec.lifecycle.toLowerCase()
      ) {
        await this.events.publish({
          topic: 'entityChanged',
          eventPayload: {
            aspect: 'lifecycle',
            entityRef: stringifyEntityRef(entity),
          }
        });
      }
    }
  }

  private async systemChanged(entity: Entity, entityCatalog: Entity | undefined) {
    if (['api', 'component', 'resource',].includes(entity.kind.toLowerCase())) {
      if (
        (entity.spec as { system: string }).system
        && entityCatalog && (entityCatalog.spec as { system: string }).system
        && (entity.spec as { system: string }).system.toLowerCase() !== (entityCatalog.spec as { system: string }).system.toLowerCase()
      ) {
        await this.events.publish({
          topic: 'entityChanged',
          eventPayload: {
            aspect: 'system',
            entityRef: stringifyEntityRef(entity),
          }
        });
      }
    }
  }

  private async definitionChanged(entity: Entity, entityCatalog: Entity | undefined) {
    if (['api',].includes(entity.kind.toLowerCase())) {
      if (
        (entity.spec as { definition: string }).definition
        && entityCatalog && (entityCatalog.spec as { definition: string }).definition
        && this.getHash((entity.spec as { definition: string }).definition) !== this.getHash((entityCatalog.spec as { definition: string }).definition)
      ) {
        await this.events.publish({
          topic: 'entityChanged',
          eventPayload: {
            aspect: 'definition',
            entityRef: stringifyEntityRef(entity),
          }
        });
      }
    }
  }

  private async ownerChanged(entity: Entity, entityCatalog: Entity | undefined) {
    if (['api', 'component', 'resource', 'system', 'domain'].includes(entity.kind.toLowerCase())) {
      if (
        (entity.spec as { owner: string }).owner
        && entityCatalog && (entityCatalog.spec as { owner: string }).owner
        && (entity.spec as { owner: string }).owner.toLowerCase() !== (entityCatalog.spec as { owner: string }).owner.toLowerCase()
      ) {
        await this.events.publish({
          topic: 'entityChanged',
          eventPayload: {
            aspect: 'owner',
            entityRef: stringifyEntityRef(entity),
          }
        });
      }
    }
  }

  private getEntityAnnotationHash(entity: Entity) {
    return entity.metadata.annotations?.[`backstage.io/entity-hash`];
  }

  private getEntityHash(entity: Entity) {
    const entityCopy = cloneDeep(entity);
    this.ignoreAttributes.forEach(attribute => {
      if (has(entityCopy, attribute)) {
        unset(entityCopy, attribute);
      }
    });
    return this.getHash(JSON.stringify(entityCopy));
  }

  private getHash(input: string) {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }

  public static fromConfig(options: { logger: LoggerService; config: Config, events: EventsService, discovery: DiscoveryService, auth: AuthService }) {
    return new EntityChangedProcessor({
      logger: options.logger,
      events: options.events,
      discovery: options.discovery,
      auth: options.auth,
      config: options.config,
    });
  }
}
