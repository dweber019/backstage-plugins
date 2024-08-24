import { ResponseError } from '@backstage/errors';
import { SubscribeApi, SubscribeResponse } from './types';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

export interface ClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
}

export class SubscribeClient implements SubscribeApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  constructor(options: ClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  async getAll(): Promise<SubscribeResponse[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}`, {
      ...(await this.buildInitRequest()),
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }

  async get(entityRef: string, userEntityRef: string): Promise<SubscribeResponse[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}?entityRef=${entityRef}&userEntityRef=${userEntityRef}`, {
      ...(await this.buildInitRequest()),
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }

  async getByEntity(entityRef: string): Promise<SubscribeResponse[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}?entityRef=${entityRef}`, {
      ...(await this.buildInitRequest()),
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }

  async getByUser(entityRef: string): Promise<SubscribeResponse[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}?userEntityRef=${entityRef}`, {
      ...(await this.buildInitRequest()),
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }

  async update(entityRef: string, userEntityRef: string, type: string): Promise<SubscribeResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}`, {
      ...(await this.buildInitRequest()),
      method: 'put',
      body: JSON.stringify({
        entityRef,
        userEntityRef,
        type,
      })
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
    return res.json();
  }

  async delete(entityRef: string, userEntityRef: string, type: string): Promise<void> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}?entityRef=${entityRef}&userEntityRef=${userEntityRef}&type=${type}`, {
      ...(await this.buildInitRequest()),
      method: 'delete',
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  async deleteByUser(entityRef: string): Promise<void> {
    const baseUrl = await this.discoveryApi.getBaseUrl('subscribe');
    const res = await fetch(`${baseUrl}?userEntityRef=${entityRef}`, {
      ...(await this.buildInitRequest()),
      method: 'delete',
    });
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  private async buildInitRequest(): Promise<RequestInit> {
    const { token } = await this.identityApi.getCredentials();
    return {
      headers: {
        Accept: `application/json`,
        'Content-Type': `application/json`,
        ...(token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : {}),
      },
    };
  }
}
