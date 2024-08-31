import { resolvePackagePath } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { EntityMissingResults, ProcessedEntity } from '@dweber019/backstage-plugin-missing-entity-common';

export type RawDbRow = {
  entity_ref: string;
  entity_refs_missing: string;
  processed_date?: Date;
};

/** @public */
export interface MissingEntityBackendStore {
  insertMissingEntity(entityMissing: EntityMissingResults): Promise<void>;
  insertNewEntity(entityRef: string): Promise<void>;
  getMissingEntities(entityRef: string): Promise<EntityMissingResults | undefined>;
  getProcessedEntities(): Promise<ProcessedEntity[]>;
  getUnprocessedEntities(): Promise<string[]>;
  getAllEntities(onlyWithMissing: boolean): Promise<EntityMissingResults[]>;
  getEntitiesByRefs(entityRefs: string[], onlyWithMissing: boolean): Promise<EntityMissingResults[]>;
  deleteEntity(entityRef: string): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@dweber019/backstage-plugin-missing-entity-backend',
  'migrations',
);

/** @public */
export class MissingEntityBackendDatabase implements MissingEntityBackendStore {
  static async create(knex: Knex): Promise<MissingEntityBackendStore> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    return new MissingEntityBackendDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  async insertMissingEntity(entityMissing: EntityMissingResults): Promise<void> {
    await this.db<RawDbRow>('missing_entity')
      .insert({
        entity_ref: entityMissing.entityRef,
        entity_refs_missing: JSON.stringify(entityMissing.missingEntityRefs),
        processed_date: new Date(),
      })
      .onConflict('entity_ref')
      .merge(['entity_refs_missing', 'processed_date']);
  }

  async insertNewEntity(entityRef: string): Promise<void> {
    await this.db<RawDbRow>('missing_entity')
      .insert({
        entity_ref: entityRef,
      })
      .onConflict('entity_ref')
      .ignore(); // If the entity_ref is in the table already then we don't want to add it again
  }

  async getMissingEntities(entityRef: string): Promise<EntityMissingResults | undefined> {
    const entityResults = await this.db<RawDbRow>('missing_entity')
      .whereNotNull('entity_refs_missing')
      .where({ entity_ref: entityRef })
      .first();

    if (!entityResults || !entityResults.entity_refs_missing) {
      return undefined;
    }

    try {
      return {
        entityRef: entityResults.entity_ref,
        missingEntityRefs: entityResults.entity_refs_missing ? JSON.parse(entityResults.entity_refs_missing) : [],
      };
    } catch (error) {
      throw new Error(`Failed to query missing entity for '${entityRef}', ${error}`);
    }
  }

  async getProcessedEntities(): Promise<ProcessedEntity[]> {
    const rawEntities = await this.db<RawDbRow>('missing_entity')
      .whereNotNull('processed_date')
      .whereNotNull('entity_refs_missing');

    if (!rawEntities) {
      return [];
    }

    const processedEntities = rawEntities.map(rawEntity => {
      // Note: processed_date should never be null, this is handled by the DB query above
      let processedDate = new Date();
      if (rawEntity.processed_date) {
        // SQLite will return a Timestamp whereas Postgres will return a proper Date
        // This tests to see if we are getting a timestamp and convert if needed
        processedDate = new Date(+rawEntity.processed_date.toString());
        if (isNaN(+rawEntity.processed_date.toString())) {
          processedDate = rawEntity.processed_date;
        }
      }

      return {
        entityRef: rawEntity.entity_ref,
        processedDate,
      };
    });

    return processedEntities;
  }

  async getUnprocessedEntities(): Promise<string[]> {
    const rawEntities = await this.db<RawDbRow>('missing_entity')
      .whereNull('entity_refs_missing')
      .orderBy('created_at', 'asc');

    if (!rawEntities) {
      return [];
    }

    return rawEntities.map(rawEntity => {
      return rawEntity.entity_ref;
    });
  }

  async getAllEntities(onlyWithMissing = false): Promise<EntityMissingResults[]> {
    let rawEntities;
    if (onlyWithMissing) {
      rawEntities = await this.db<RawDbRow>('missing_entity')
        .whereNotNull('entity_refs_missing')
        .andWhereRaw('LENGTH(entity_refs_missing) > 2');
    } else {
      rawEntities = await this.db<RawDbRow>('missing_entity');
    }

    if (!rawEntities) {
      return [];
    }

    return rawEntities.map(rawEntity => {
      return {
        entityRef: rawEntity.entity_ref,
        missingEntityRefs: rawEntity.entity_refs_missing ? JSON.parse(rawEntity.entity_refs_missing) : [],
      };
    });
  }

  async getEntitiesByRefs(entityRefs: string[], onlyWithMissing = false): Promise<EntityMissingResults[]> {
    let rawEntities;
    if (onlyWithMissing) {
      rawEntities = await this.db<RawDbRow>('missing_entity')
        .whereIn('entity_ref', entityRefs).and
        .whereNotNull('entity_refs_missing')
        .andWhereRaw('LENGTH(entity_refs_missing) > 2');
    } else {
      rawEntities = await this.db<RawDbRow>('missing_entity')
        .whereIn('entity_ref', entityRefs);
    }

    if (!rawEntities) {
      return [];
    }

    return rawEntities.map(rawEntity => {
      return {
        entityRef: rawEntity.entity_ref,
        missingEntityRefs: rawEntity.entity_refs_missing ? JSON.parse(rawEntity.entity_refs_missing) : [],
      };
    });
  }

  async deleteEntity(entityRef: string): Promise<void> {
    await this.db<RawDbRow>('missing_entity')
      .where('entity_ref', entityRef)
      .delete();
  }
}
