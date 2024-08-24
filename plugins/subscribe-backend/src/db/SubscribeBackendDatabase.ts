import { resolvePackagePath } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';

export type RawDbRow = {
  entity_ref: string;
  user_entity_ref: string;
  type: string;
};

/** @public */
export interface SubscribeBackendStore {
  insert(data: RawDbRow): Promise<void>;
  getAll(): Promise<RawDbRow[]>;
  get(data: Omit<RawDbRow, 'type'>): Promise<RawDbRow[]>;
  getByEntity(entityRef: string): Promise<RawDbRow[]>;
  getByUser(entityRef: string): Promise<RawDbRow[]>;
  delete(data: RawDbRow): Promise<void>;
  deleteByUser(entityRef: string): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@dweber019/backstage-plugin-subscribe-backend',
  'migrations',
);

/** @public */
export class SubscribeBackendDatabase implements SubscribeBackendStore {
  static TABLE_SUBSCRIPTIONS = 'subscriptions';

  static async create(knex: Knex): Promise<SubscribeBackendStore> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    return new SubscribeBackendDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  async insert(data: RawDbRow): Promise<void> {
    const exists = await this.get(data);
    if (exists) {
      return;
    }
    await this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS).insert(
      data,
    );
  }

  async getAll(): Promise<RawDbRow[]> {
    return this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS);
  }

  async get(data: RawDbRow): Promise<RawDbRow[]> {
    return this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS)
      .where('entity_ref', data.entity_ref)
      .andWhere('user_entity_ref', data.user_entity_ref);
  }

  async getByEntity(entityRef: string): Promise<RawDbRow[]> {
    return this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS)
      .where('entity_ref', entityRef);
  }

  async getByUser(entityRef: string): Promise<RawDbRow[]> {
    return this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS)
      .where('user_entity_ref', entityRef);
  }

  async delete(data: RawDbRow): Promise<void> {
    await this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS)
      .where('entity_ref', data.entity_ref)
      .andWhere('user_entity_ref', data.user_entity_ref)
      .andWhere('type', data.type)
      .delete();
  }

  async deleteByUser(entityRef: string): Promise<void> {
    await this.db<RawDbRow>(SubscribeBackendDatabase.TABLE_SUBSCRIPTIONS)
      .where('user_entity_ref', entityRef)
      .delete();
  }
}
