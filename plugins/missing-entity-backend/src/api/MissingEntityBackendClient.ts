import {
  EntitiesOverview,
  EntitiesPageResult,
  EntityMissingResults,
} from '@dweber019/backstage-plugin-missing-entity-common';
import { CatalogApi, GetEntitiesRequest } from '@backstage/catalog-client';

import { DateTime } from 'luxon';
import { MissingEntityBackendStore } from '../db';
import { Entity, GroupEntity, parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { assertError } from '@backstage/errors';
import { HumanDuration } from '@backstage/types';
import { type AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { isEqual } from 'lodash';
import { NotificationService } from '@backstage/plugin-notifications-node';

/** @public */
export interface MissingEntityBackendApi {
  getMissingEntities(entityRef: string, refresh: boolean): Promise<EntityMissingResults>;
  getAllMissingEntities(onlyWithMissing: boolean, owner: string | undefined): Promise<EntitiesPageResult>;
  processEntities(): Promise<void>;
}

/** @public */
export class MissingEntityBackendClient implements MissingEntityBackendApi {
  private readonly logger: LoggerService;
  private readonly store: MissingEntityBackendStore;
  private readonly auth: AuthService;
  private readonly notification: NotificationService;

  private readonly catalogApi: CatalogApi;
  private readonly age?: HumanDuration;
  private readonly batchSize?: number;
  private readonly kindAndType: { kind: string, type?: string }[];
  private readonly excludeKindAndType: { kind: string, type?: string }[];
  public constructor(
    logger: LoggerService,
    store: MissingEntityBackendStore,
    auth: AuthService,
    catalogApi: CatalogApi,
    notification: NotificationService,
    age?: HumanDuration,
    batchSize?: number,
    kindAndType?: { kind: string, type?: string }[],
    excludeKindAndType?: { kind: string, type?: string }[],
  ) {
    this.logger = logger;
    this.store = store;
    this.auth = auth;
    this.catalogApi = catalogApi;
    this.notification = notification;
    this.batchSize = batchSize;
    this.age = age;
    this.kindAndType = kindAndTypeOrDefault(kindAndType);
    this.excludeKindAndType = excludeKindAndType ?? [];
  }

  async getMissingEntities(entityRef: string, refresh = false): Promise<EntityMissingResults> {
    this.logger?.debug(`Getting missing entities for entity "${entityRef}"`);
    if (refresh) {
      await this.processEntityRelations(entityRef);
    }
    let missingEntities = await this.store.getMissingEntities(entityRef);
    if (!missingEntities && !refresh) {
      await this.processEntityRelations(entityRef);
      missingEntities = await this.store.getMissingEntities(entityRef);
    }
    return missingEntities!;
  }

  async getAllMissingEntities(onlyWithMissing = false, owner: string | undefined): Promise<EntitiesPageResult> {
    this.logger?.debug(`Getting all missing entities"`);

    let entityResult: EntityMissingResults[] = [];
    if (owner) {
      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const response = await this.catalogApi.queryEntities({
        filter: {
          'relations.ownedBy': owner.split(','),
        },
        fields: [ 'kind', 'metadata.name', 'metadata.namespace' ]
      }, { token });
      entityResult = await this.store.getEntitiesByRefs(response.items.map(item => stringifyEntityRef(item)), onlyWithMissing);
    } else {
      entityResult = await this.store.getAllEntities(onlyWithMissing);
    }

    return {
      overview: await this.getEntitiesOverview(),
      entities: entityResult,
    };
  }

  async processEntities(): Promise<void> {
    this.logger?.info('Updating list of entities');
    await this.addNewEntities();

    this.logger?.info('Cleaning list of entities');
    await this.cleanEntities();

    this.logger?.info('Processing applicable entities through missing entity');
    await this.processEntitiesRelations();
  }

  /** @internal */
  async addNewEntities(): Promise<void> {
    const filter = this.kindAndType.map(value => {
      return {
        kind: value.kind,
        ...(value.type ? { 'spec.type': value.type } : {}),
      }
    });
    const request: GetEntitiesRequest = {
      filter,
      fields: ['kind', 'metadata', 'spec.type'],
    };

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const response = await this.catalogApi.getEntities(request, { token });
    const entities = response.items.filter(item => !this.isEntityExcluded(item));

    entities.forEach(entity => {
      const entityRef = stringifyEntityRef(entity);
      this.store.insertNewEntity(entityRef);
    });
  }

  /** @internal */
  async cleanEntities(): Promise<void> {
    this.logger?.info('Cleaning entities in missing entity queue');
    const allEntities = (await this.store.getAllEntities(false)).map(item => item.entityRef);

    for (const entityRef of allEntities) {
      const { token } = await this.auth.getPluginRequestToken({
        onBehalfOf: await this.auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });
      const result = await this.catalogApi.getEntityByRef(entityRef, { token });

      if (!result) {
        this.logger?.info(
          `Entity ${entityRef} was not found in the Catalog, it will be deleted`,
        );
        await this.store.deleteEntity(entityRef);
      }
    }
  }

  /** @internal */
  async processEntitiesRelations(): Promise<void> {
    const entitiesOverview = await this.getEntitiesOverview();
    this.logger?.info(
      `Entities overview: Entity: ${entitiesOverview.entityCount}, Processed: ${entitiesOverview.processedCount}, Pending: ${entitiesOverview.pendingCount}, Stale ${entitiesOverview.staleCount}`,
    );

    const entities = entitiesOverview.filteredEntities.slice(
      0,
      this.batchSize ?? 20,
    );

    for (const entityRef of entities) {
      try {
        await this.processEntityRelations(entityRef);
      } catch (error) {
        assertError(error);
        this.logger.error(
          `Unable to process "${entityRef}", message: ${error.message}, stack: ${error.stack}`,
        );
      }
    }
  }

  /** @internal */
  async getEntitiesOverview(): Promise<EntitiesOverview> {
    this.logger?.debug('Getting pending entities');

    const processedEntities = await this.store.getProcessedEntities();
    const staleEntities = processedEntities
      .filter(pe => {
        if (this.age === undefined) return false;
        const staleDate = DateTime.now().minus(this.age as HumanDuration);
        return DateTime.fromJSDate(pe.processedDate) <= staleDate;
      })
      .map(pe => pe.entityRef);

    const unprocessedEntities = await this.store.getUnprocessedEntities();
    const filteredEntities = unprocessedEntities.concat(staleEntities);

    return {
      entityCount: unprocessedEntities.length + processedEntities.length,
      processedCount: processedEntities.length,
      staleCount: staleEntities.length,
      pendingCount: filteredEntities.length,
      filteredEntities: filteredEntities,
    };
  }

  /** @internal */
  async processEntityRelations(
    entityRef: string,
  ): Promise<void> {
    this.logger?.info(
      `Processing relations for entity ${entityRef}`,
    );

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const entity = await this.catalogApi.getEntityByRef(entityRef, {
      token,
    });
    if (!entity) {
      throw new Error('Entity doesn\'t exist in catalog.');
    }
    if (!this.isEntityIncluded(entity)) {
      return;
    }
    if (this.isEntityExcluded(entity)) {
      return;
    }

    const entityResults: EntityMissingResults = {
      entityRef,
      missingEntityRefs: [],
    };

    const entityRefRelations = entity.relations?.map(
      relation => relation.targetRef,
    );
    if (
      entityRefRelations &&
      entityRefRelations?.length > 1
    ) {
      const relatedEntities = await this.catalogApi.getEntitiesByRefs({
        entityRefs: entityRefRelations.slice(0, 1000),
        fields: ['kind', 'metadata.name', 'metadata.namespace'],
      }, { token });

      entityResults.missingEntityRefs = entityRefRelations.slice(0, 1000).filter(
        (_, index) => relatedEntities.items[index] === undefined,
      );
    }

    const existing = await this.store.getMissingEntities(entityRef);
    if (entityResults.missingEntityRefs.length > 0 && !isEqual(existing?.missingEntityRefs.sort(), entityResults.missingEntityRefs.sort())) {
      try {
        await this.notification.send({
          recipients: {
            type: 'entity',
            entityRef: this.getNotificationRecipient(entity),
          },
          payload: {
            title: `Entity ${entityRef} has relations to other entities, which are missing`,
            description:  `The following entities are missing ${entityResults.missingEntityRefs.join(', ')}.`,
            link: `/catalog/${entity.metadata.namespace}/${entity.kind}/${entity.metadata.name}`,
            topic: 'missing-entity',
            scope: `missing-entity.${entityRef}`,
            severity: 'high',
          },
        });
      } catch (e) {
        this.logger.info('Notification plugin not installed, not sending notifications for missing entities.')
      }
    }

    await this.store.insertMissingEntity(entityResults);
  }

  private getNotificationRecipient(entity: Entity) {
    if (['API', 'Component', 'Resource', 'System', 'Domain'].includes(entity.kind)) {
      return stringifyEntityRef(parseEntityRef((entity.spec as { owner: string }).owner, { defaultKind: 'Group' }));
    }
    if (entity.kind === 'User') {
      return stringifyEntityRef(entity);
    }
    if (entity.kind === 'Group') {
      return (entity as GroupEntity).spec.members?.map(member => stringifyEntityRef(parseEntityRef(member, { defaultKind: 'User' }))) ?? [];
    }
    return [];
  }

  private isEntityIncluded(entity: Entity) {
    return this.kindAndType.some(kindAndType =>
      entity.kind.toLowerCase() === kindAndType.kind.toLowerCase()
      && (kindAndType.type === undefined || (entity as { spec?: { type?: string }}).spec?.type?.toLowerCase() === kindAndType.type?.toLowerCase())
    );
  }

  private isEntityExcluded(entity: Entity) {
    return this.excludeKindAndType.some(excludeKindAndType =>
      entity.kind.toLowerCase() === excludeKindAndType.kind.toLowerCase()
      && (excludeKindAndType.type === undefined || (entity as { spec?: { type?: string }}).spec?.type?.toLowerCase() === excludeKindAndType.type?.toLowerCase())
    );
  }
}

export function kindAndTypeOrDefault(kindAndType?: { kind: string, type?: string }[]): { kind: string, type?: string }[] {
  if (!kindAndType || kindAndType.length === 0) {
    return [{ kind: 'API' }, { kind: 'Component' }, { kind: 'Resource' }, { kind: 'User' }, { kind: 'Group' },
      { kind: 'System' }, { kind: 'Domain' }];
  }
  return kindAndType;
}
