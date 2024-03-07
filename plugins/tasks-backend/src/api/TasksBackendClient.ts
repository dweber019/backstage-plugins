import { BasicTask, Task } from '@dweber019/backstage-plugin-tasks-common';
import { Logger } from 'winston';
import { RawDbEntityRefsRow, RawDbTasksRow, TasksBackendStore } from '../db';
import { BackstageUserIdentity } from '@backstage/core-plugin-api';

/** @public */
export interface TasksBackendApi {
  getTasks(): Promise<Task[]>;
  getMyTasks(identity: BackstageUserIdentity): Promise<Task[]>;
  getTasksByTarget(entityRef: string): Promise<Task[]>;
  createTask(task: Task): Promise<string>;
  createSubTask(parentTaskId: string, task: Task): Promise<string>;
  updateTask(task: Task): Promise<string>;
  updateSubTask(parentTaskId: string, task: Task): Promise<string>;
  deleteTask(id: string): Promise<void>;
}

/** @public */
export class TasksBackendClient implements TasksBackendApi {
  // @ts-ignore
  private readonly logger: Logger;
  private readonly store: TasksBackendStore;
  public constructor(logger: Logger, store: TasksBackendStore) {
    this.logger = logger;
    this.store = store;
  }

  async getTasks(): Promise<Task[]> {
    const rawDbTasksRows = await this.store.getTasks();
    const rawDbEntityRefsRows = await this.store.getEntityRefsByTaskIds(
      rawDbTasksRows.map(value => value.id!),
    );
    return this.dbToTasks(rawDbTasksRows, rawDbEntityRefsRows);
  }

  async getMyTasks(identity: BackstageUserIdentity): Promise<Task[]> {
    const rawDbTasksRows = await this.store.getTasksByAssignees([
      identity.userEntityRef,
      ...identity.ownershipEntityRefs,
    ]);
    const rawDbTasksRowsParents = await this.store.getTasksById(
      rawDbTasksRows
        .filter(value => value.parent_task_id)
        .map(value => value.parent_task_id!),
    );
    const rawDbTasksRowsAll = [...rawDbTasksRows, ...rawDbTasksRowsParents];
    const rawDbEntityRefsRows = await this.store.getEntityRefsByTaskIds(
      rawDbTasksRowsAll.map(value => value.id!),
    );
    return this.dbToTasks(rawDbTasksRowsAll, rawDbEntityRefsRows);
  }

  async getTasksByTarget(entityRef: string): Promise<Task[]> {
    const rawDbTasksRows = await this.store.getTasksByTarget(entityRef);
    const rawDbTasksRowsParents = await this.store.getTasksById(
      rawDbTasksRows
        .filter(value => value.parent_task_id)
        .map(value => value.parent_task_id!),
    );
    const rawDbTasksRowsAll = [...rawDbTasksRows, ...rawDbTasksRowsParents];
    const rawDbEntityRefsRows = await this.store.getEntityRefsByTaskIds(
      rawDbTasksRowsAll.map(value => value.id!),
    );
    return this.dbToTasks(rawDbTasksRowsAll, rawDbEntityRefsRows);
  }

  async createTask(task: Task): Promise<string> {
    const newTask = this.taskToDbTask(task, undefined);
    const taskId = await this.store.insertTask(newTask);
    console.log(taskId);
    await this.store.deleteEntityRef(taskId);
    await Promise.all(
      this.taskToEntityRefs(task).map(async value =>
        this.store.insertEntityRef(value),
      ),
    );

    return taskId;
  }

  async createSubTask(parentTaskId: string, task: Task): Promise<string> {
    const newTask = this.taskToDbTask(task, parentTaskId);
    const taskId = await this.store.insertTask(newTask);
    await this.store.deleteEntityRef(taskId);
    await Promise.all(
      this.taskToEntityRefs(task).map(async value =>
        this.store.insertEntityRef(value),
      ),
    );

    return taskId;
  }

  async updateTask(task: Task): Promise<string> {
    return this.createTask(task);
  }

  updateSubTask(parentTaskId: string, task: Task): Promise<string> {
    return this.createSubTask(parentTaskId, task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.store.deleteTask(id);
  }

  private taskToDbTask(
    task: Task,
    parentTaskId: string | undefined,
  ): Omit<RawDbTasksRow, 'created_at'> {
    return {
      id: task.id,
      title: task.title,
      text: task.text,
      completed: task.completed,
      due_date: task.dueDate,
      parent_task_id: parentTaskId,
      updated_by_entity_ref: '',
      created_by_entity_ref: '',
    };
  }

  private taskToEntityRefs(task: Task): RawDbEntityRefsRow[] {
    return [
      ...task.assigneeEntityRefs.map(value => ({
        task_id: task.id!,
        entity_ref: value,
        type: 'assignee',
      })),
      ...task.targetsEntityRefs.map(value => ({
        task_id: task.id!,
        entity_ref: value,
        type: 'target',
      })),
    ] as RawDbEntityRefsRow[];
  }

  private dbToTasks(
    dbTasks: RawDbTasksRow[],
    dbEntityRefs: RawDbEntityRefsRow[],
  ): Task[] {
    const taskMap: Map<string, Task> = new Map();
    dbTasks
      .filter(value => !value.parent_task_id)
      .forEach(value =>
        taskMap.set(
          value.id!,
          this.addEntityRefs(this.dbToTask(value), dbEntityRefs),
        ),
      );
    dbTasks
      .filter(value => value.parent_task_id)
      .forEach(value => {
        const task = taskMap.get(value.parent_task_id!);
        task!.subTasks.push(
          this.addEntityRefs(this.dbToBasicTask(value), dbEntityRefs),
        );
        taskMap.set(value.parent_task_id!, task!);
      });
    return Array.from(taskMap.values());
  }

  private dbToTask(dbTask: RawDbTasksRow): Task {
    return {
      id: dbTask.id!,
      title: dbTask.title,
      text: dbTask.text,
      completed: Boolean(dbTask.completed),
      dueDate: dbTask.due_date,
      assigneeEntityRefs: [],
      targetsEntityRefs: [],
      createdAt: dbTask.created_at,
      createdByEntityRef: dbTask.created_by_entity_ref,
      updateByEntityRef: dbTask.updated_by_entity_ref,
      subTasks: [],
    };
  }

  private dbToBasicTask(dbTask: RawDbTasksRow): BasicTask {
    return {
      id: dbTask.id!,
      title: dbTask.title,
      text: dbTask.text,
      completed: Boolean(dbTask.completed),
      dueDate: dbTask.due_date,
      assigneeEntityRefs: [],
      targetsEntityRefs: [],
      createdAt: dbTask.created_at,
      createdByEntityRef: dbTask.created_by_entity_ref,
      updateByEntityRef: dbTask.updated_by_entity_ref,
    };
  }

  private addEntityRefs<T extends Task | BasicTask>(
    task: T,
    entityRefs: RawDbEntityRefsRow[],
  ): T {
    task.assigneeEntityRefs = entityRefs
      .filter(value => value.task_id === task.id && value.type === 'assignee')
      .map(value => value.entity_ref);
    task.targetsEntityRefs = entityRefs
      .filter(value => value.task_id === task.id && value.type === 'target')
      .map(value => value.entity_ref);
    return task;
  }
}
