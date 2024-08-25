import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { EntitiesPageResult, EntityMissingResults } from '@dweber019/backstage-plugin-missing-entity-common';
import { MissingEntityApi } from './MissingEntityApi';

export class MissingEntityClient implements MissingEntityApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  public constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  public async getMissingEntities(entityRef: string, refresh = false): Promise<EntityMissingResults> {
    const queryString = new URLSearchParams();
    queryString.append('entityRef', entityRef);
    queryString.append('refresh', `${refresh}`);

    const urlSegment = `entity?${queryString}`;

    return await this.get<EntityMissingResults>(urlSegment);
  }

  public async getAllMissingEntities(onlyWithMissing = false): Promise<EntitiesPageResult> {
    const queryString = new URLSearchParams();
    queryString.append('onlyWithMissing', `${onlyWithMissing}`);

    const urlSegment = `entities?${queryString}`;

    return await this.get<EntitiesPageResult>(urlSegment);
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('missing-entity')}/`;
    const url = new URL(path, baseUrl);

    const response = await this.fetchApi.fetch(url.toString());

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
