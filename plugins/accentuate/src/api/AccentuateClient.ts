import { ResponseError } from '@backstage/errors';
import { AccentuateApi } from './types';
import {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { CatalogApi } from '@backstage/plugin-catalog-react';
import {
  AccentuateResponse,
  AccentuateInput,
} from '@dweber019/backstage-plugin-accentuate-common';
import { JsonObject } from '@backstage/types';

/** @public */
export interface JsonSchema {
  kind: string;
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

/** @public */
export interface AccentuateClientOptions {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  catalogApi: CatalogApi;
  identityApi: IdentityApi;
  schemas: JsonSchema[];
}

const initRequestOption = {
  headers: { Accept: `application/json`, 'Content-Type': `application/json` },
};

/** @public */
export class AccentuateClient implements AccentuateApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly catalogApi: CatalogApi;
  private readonly identityApi: IdentityApi;
  private readonly schemas: JsonSchema[];

  constructor(options: AccentuateClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.catalogApi = options.catalogApi;
    this.identityApi = options.identityApi;
    this.schemas = options.schemas;
  }

  async getAll(): Promise<AccentuateResponse[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('accentuate');
    const res = await this.fetchApi.fetch(baseUrl, initRequestOption);

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return (await res.json()) as AccentuateResponse[];
  }

  async get(entityRef: string): Promise<AccentuateResponse | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('accentuate');
    const res = await this.fetchApi.fetch(
      `${baseUrl}/?entityRef=${encodeURIComponent(entityRef)}`,
      initRequestOption,
    );

    if (res.status === 404) {
      return undefined;
    }
    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return (await res.json()) as AccentuateResponse;
  }

  async update(
    entityRef: string,
    data: JsonObject,
  ): Promise<AccentuateResponse> {
    const baseUrl = await this.discoveryApi.getBaseUrl('accentuate');
    const res = await this.fetchApi.fetch(baseUrl, {
      ...initRequestOption,
      method: 'PUT',
      body: JSON.stringify({
        entityRef,
        data,
      } as AccentuateInput),
    });

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return (await res.json()) as AccentuateResponse;
  }

  async delete(entityRef: string): Promise<void> {
    const baseUrl = await this.discoveryApi.getBaseUrl('accentuate');
    const res = await this.fetchApi.fetch(
      `${baseUrl}/?entityRef=${encodeURIComponent(entityRef)}`,
      {
        ...initRequestOption,
        method: 'DELETE',
      },
    );

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  getSchema(kind: string): JsonSchema | undefined {
    return this.schemas.find(schema => schema.kind === kind);
  }

  async refresh(entityRef: string): Promise<void> {
    const { token } = await this.identityApi.getCredentials();
    await this.catalogApi.refreshEntity(entityRef, { token });
  }
}
