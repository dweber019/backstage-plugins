import { createApiRef } from '@backstage/core-plugin-api';
import { Task, BasicTask } from '@dweber019/backstage-plugin-tasks-common';

export const tasksApiRef = createApiRef<TasksApi>({
  id: 'plugin.tasks.service',
});

export type IdResponse = { id: string };

export interface TasksApi {
  getTasks(): Promise<Task[]>;
  getMyTasks(): Promise<Task[]>;
  getTaskForEntity(entityRef: string): Promise<Task[]>;
  createTask(task: Task): Promise<IdResponse>;
  updateTask(task: Task): Promise<IdResponse>;
  deleteTask(taskId: string): Promise<void>;
  createSubTask(parentTaskId: string, task: BasicTask): Promise<IdResponse>;
  updateSubTask(parentTaskId: string, task: BasicTask): Promise<IdResponse>;
}
