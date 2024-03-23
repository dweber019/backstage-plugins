import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';

export type RawDbRow = {
  entity_ref: string;
  data: string;
  changed_at: string;
  changed_by_entity_ref: string;
};

/** @public */
export interface AccentuateBackendStore {
  insert(data: RawDbRow): Promise<void>;
  getAll(): Promise<RawDbRow[]>;
  get(entityRef: string): Promise<RawDbRow | undefined>;
  delete(entityRef: string): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@dweber019/backstage-plugin-accentuate-backend',
  'migrations',
);

// const seedDir = resolvePackagePath(
//   '@dweber019/backstage-plugin-accentuate-backend',
//   'seeds',
// );

/** @public */
export class AccentuateBackendDatabase implements AccentuateBackendStore {
  static TABLE_ACCENTUATES = 'accentuates';

  static async create(knex: Knex): Promise<AccentuateBackendStore> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    // await knex.seed.run({
    //   directory: seedDir,
    // });
    return new AccentuateBackendDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  async insert(data: RawDbRow): Promise<void> {
    const exists = await this.get(data.entity_ref);
    if (exists) {
      await this.db<RawDbRow>(AccentuateBackendDatabase.TABLE_ACCENTUATES)
        .update(data)
        .where('entity_ref', data.entity_ref);
      return;
    }
    await this.db<RawDbRow>(AccentuateBackendDatabase.TABLE_ACCENTUATES).insert(
      data,
    );
  }

  async getAll(): Promise<RawDbRow[]> {
    return this.db<RawDbRow>(AccentuateBackendDatabase.TABLE_ACCENTUATES);
  }

  async get(entityRef: string): Promise<RawDbRow | undefined> {
    return this.db<RawDbRow>(AccentuateBackendDatabase.TABLE_ACCENTUATES)
      .where('entity_ref', entityRef)
      .first();
  }

  async delete(entityRef: string): Promise<void> {
    await this.db<RawDbRow>(AccentuateBackendDatabase.TABLE_ACCENTUATES)
      .where('entity_ref', entityRef)
      .delete();
  }
}
