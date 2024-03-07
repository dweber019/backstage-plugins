import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { IdResponse, TasksApi } from './TasksApi';
import { BasicTask, Task } from '@dweber019/backstage-plugin-tasks-common';

export class TasksClient implements TasksApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  public constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  async getMyTasks(): Promise<Task[]> {
    return this.get<Task[]>('/me');
  }

  async getTaskForEntity(entityRef: string): Promise<Task[]> {
    const queryString = new URLSearchParams();
    queryString.append('entityRef', entityRef);
    return this.get<Task[]>(`?${queryString}`);
  }

  async getTasks(): Promise<Task[]> {
    return this.get<Task[]>('');
  }

  async createTask(task: Task): Promise<IdResponse> {
    return await this.post('', task);
  }

  async updateTask(task: Task): Promise<IdResponse> {
    return await this.post(`/${task.id}`, task, 'PUT');
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.delete(`/${taskId}`);
  }

  async createSubTask(
    parentTaskId: string,
    task: BasicTask,
  ): Promise<IdResponse> {
    return await this.post(`/${parentTaskId}/tasks`, task);
  }

  async updateSubTask(
    parentTaskId: string,
    task: BasicTask,
  ): Promise<IdResponse> {
    return await this.post(`/${parentTaskId}/tasks`, task, 'PUT');
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(await this.getUrl(path), {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return (await response.json()) as Promise<T>;
  }

  private async post<T>(
    path: string,
    data: T,
    method: 'POST' | 'PUT' = 'POST',
  ): Promise<IdResponse> {
    const response = await fetch(await this.getUrl(path), {
      method,
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return (await response.json()) as Promise<IdResponse>;
  }

  private async delete(path: string): Promise<void> {
    const response = await fetch(await this.getUrl(path), {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
  }

  private async getUrl(path: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('tasks');
    return `${baseUrl}${path}`;
  }

  private async getHeaders() {
    const { token } = await this.identityApi.getCredentials();
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : ({} as HeadersInit);
    return { ...headers, 'content-type': 'application/json' };
  }
}
