import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export type RawDbTasksRow = {
  id?: string;
  title: string;
  text?: string;
  completed: boolean;
  due_date?: string;
  created_at: string;
  created_by_entity_ref: string;
  updated_by_entity_ref: string;
  parent_task_id?: string;
};

export type RawDbEntityRefsRow = {
  task_id: string;
  type: 'assignee' | 'target';
  entity_ref: string;
};

/** @public */
export interface TasksBackendStore {
  insertTask(task: Omit<RawDbTasksRow, 'created_at'>): Promise<string>;
  getTasks(): Promise<RawDbTasksRow[]>;
  getTasksById(ids: string[]): Promise<RawDbTasksRow[]>;
  getTasksByAssignees(entityRefs: string[]): Promise<RawDbTasksRow[]>;
  getTasksByTarget(targetEntityRef: string): Promise<RawDbTasksRow[]>;
  deleteTask(id: string): Promise<void>;

  insertEntityRef(entityRef: RawDbEntityRefsRow): Promise<void>;
  getEntityRefsByTaskIds(ids: string[]): Promise<RawDbEntityRefsRow[]>;
  deleteEntityRef(taskId: string): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@dweber019/backstage-plugin-tasks-backend',
  'migrations',
);

const seedDir = resolvePackagePath(
  '@dweber019/backstage-plugin-tasks-backend',
  'seeds',
);

/** @public */
export class TasksBackendDatabase implements TasksBackendStore {
  static TABLE_TASKS = 'tasks';
  static TABLE_ENTITY_REFS = 'entity_refs';

  static async create(knex: Knex): Promise<TasksBackendStore> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    await knex.seed.run({
      directory: seedDir,
    });
    return new TasksBackendDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  async insertTask(task: RawDbTasksRow): Promise<string> {
    let result: { id: string }[];
    if (task.id) {
      result = await this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS)
        .where('id', task.id)
        .update(task, ['id']);
    } else {
      result = await this.db<RawDbTasksRow>(
        TasksBackendDatabase.TABLE_TASKS,
      ).insert(
        {
          ...task,
          id: uuid(),
        },
        ['id'],
      );
    }
    return result[0].id;
  }

  async getTasks(): Promise<RawDbTasksRow[]> {
    return this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS);
  }

  async getTasksById(ids: string[]): Promise<RawDbTasksRow[]> {
    return this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS).whereIn(
      'id',
      ids,
    );
  }

  getTasksByAssignees(entityRefs: string[]): Promise<RawDbTasksRow[]> {
    return this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS)
      .select(`${TasksBackendDatabase.TABLE_TASKS}.*`)
      .innerJoin(TasksBackendDatabase.TABLE_ENTITY_REFS, function innerJoin() {
        this.on(
          `${TasksBackendDatabase.TABLE_TASKS}.id`,
          '=',
          `${TasksBackendDatabase.TABLE_ENTITY_REFS}.task_id`,
        )
          .andOnVal(
            `${TasksBackendDatabase.TABLE_ENTITY_REFS}.type`,
            'assignee',
          )
          .andOnIn(
            `${TasksBackendDatabase.TABLE_ENTITY_REFS}.entity_ref`,
            entityRefs,
          );
      });
  }

  async getTasksByTarget(targetEntityRef: string): Promise<RawDbTasksRow[]> {
    return this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS)
      .select(`${TasksBackendDatabase.TABLE_TASKS}.*`)
      .innerJoin(TasksBackendDatabase.TABLE_ENTITY_REFS, function innerJoin() {
        this.on(
          `${TasksBackendDatabase.TABLE_TASKS}.id`,
          '=',
          `${TasksBackendDatabase.TABLE_ENTITY_REFS}.task_id`,
        )
          .andOnVal(`${TasksBackendDatabase.TABLE_ENTITY_REFS}.type`, 'target')
          .andOnVal(
            `${TasksBackendDatabase.TABLE_ENTITY_REFS}.entity_ref`,
            targetEntityRef,
          );
      });
  }

  async deleteTask(id: string): Promise<void> {
    await this.db<RawDbTasksRow>(TasksBackendDatabase.TABLE_TASKS)
      .where('id', id)
      .delete();
  }

  async insertEntityRef(entityRef: RawDbEntityRefsRow): Promise<void> {
    await this.db<RawDbEntityRefsRow>(
      TasksBackendDatabase.TABLE_ENTITY_REFS,
    ).insert(entityRef);
  }

  async getEntityRefsByTaskIds(ids: string[]): Promise<RawDbEntityRefsRow[]> {
    return this.db<RawDbEntityRefsRow>(
      TasksBackendDatabase.TABLE_ENTITY_REFS,
    ).whereIn('task_id', ids);
  }

  async deleteEntityRef(taskId: string): Promise<void> {
    await this.db<RawDbEntityRefsRow>(TasksBackendDatabase.TABLE_ENTITY_REFS)
      .where('task_id', taskId)
      .delete();
  }
}
