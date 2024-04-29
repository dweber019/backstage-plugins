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
import { Entity } from '@backstage/catalog-model';

/** @public */
export interface JsonSchema {
  kind: string;
  type?: string;
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
    const res = await this.fetchApi.fetch(
      baseUrl,
      await this.buildInitRequest(),
    );

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return (await res.json()) as AccentuateResponse[];
  }

  async get(entityRef: string): Promise<AccentuateResponse | undefined> {
    const baseUrl = await this.discoveryApi.getBaseUrl('accentuate');
    const res = await this.fetchApi.fetch(
      `${baseUrl}/?entityRef=${encodeURIComponent(entityRef)}`,
      await this.buildInitRequest(),
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
      ...(await this.buildInitRequest()),
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
        ...(await this.buildInitRequest()),
        method: 'DELETE',
      },
    );

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }
  }

  getSchema(
    entity: Entity & { spec: { type?: string } },
  ): JsonSchema | undefined {
    const typeSpecificSchema = this.schemas.find(
      schema =>
        schema.kind === entity.kind &&
        entity.spec.type &&
        schema.type?.toLocaleLowerCase() ===
          entity.spec.type.toLocaleLowerCase(),
    );
    if (typeSpecificSchema) {
      return typeSpecificSchema;
    }
    return this.schemas.find(
      schema => schema.kind === entity.kind && schema.type === undefined,
    );
  }

  async refresh(entityRef: string): Promise<void> {
    const { token } = await this.identityApi.getCredentials();
    await this.catalogApi.refreshEntity(entityRef, { token });
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
