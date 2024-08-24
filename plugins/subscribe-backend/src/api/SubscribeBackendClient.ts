import { SubscribeBackendStore } from '../db';
import { RawDbRow } from '../db/SubscribeBackendDatabase';

export interface SubscribeResponse {
  entityRef: string;
  userEntityRef: string;
  type: string;
}

/** @public */
export interface SubscribeBackendApi {
  getAll(): Promise<SubscribeResponse[]>;
  get(
    entityRef: string,
    userEntityRef: string,
  ): Promise<SubscribeResponse[]>;
  getByEntity(
    entityRef: string,
  ): Promise<SubscribeResponse[]>;
  getByUser(
    entityRef: string,
  ): Promise<SubscribeResponse[]>;
  update(
    entityRef: string,
    userEntityRef: string,
    type: string,
  ): Promise<SubscribeResponse>;
  delete(
    entityRef: string,
    userEntityRef: string,
    type: string,
  ): Promise<void>;
  deleteByUser(
    entityRef: string,
  ): Promise<void>;
}

/** @public */
export class SubscribeBackendClient implements SubscribeBackendApi {
  private readonly store: SubscribeBackendStore;
  public constructor(store: SubscribeBackendStore) {
    this.store = store;
  }

  async getAll(): Promise<SubscribeResponse[]> {
    const rawDbRows = await this.store.getAll();
    return rawDbRows.map(rawDbRow => this.dbToResponse(rawDbRow));
  }

  async get(
    entityRef: string,
    userEntityRef: string,
  ): Promise<SubscribeResponse[]> {
    const rawDbRows = await this.store.get({
      entity_ref: entityRef,
      user_entity_ref: userEntityRef,
    });
    console.log(rawDbRows)
    return rawDbRows.map(rawDbRow => this.dbToResponse(rawDbRow));
  }

  async getByEntity(
    entityRef: string,
  ): Promise<SubscribeResponse[]> {
    const rawDbRows = await this.store.getByEntity(entityRef);
    return rawDbRows.map(rawDbRow => this.dbToResponse(rawDbRow));
  }

  async getByUser(
    entityRef: string,
  ): Promise<SubscribeResponse[]> {
    const rawDbRows = await this.store.getByUser(entityRef);
    return rawDbRows.map(rawDbRow => this.dbToResponse(rawDbRow));
  }

  async update(
    entityRef: string,
    userEntityRef: string,
    type: string,
  ): Promise<SubscribeResponse> {
    const data = {
      entity_ref: entityRef,
      user_entity_ref: userEntityRef,
      type,
    };
    await this.store.insert(data);
    return this.dbToResponse(data);
  }

  async delete(
    entityRef: string,
    userEntityRef: string,
    type: string,
  ): Promise<void> {
    const data = {
      entity_ref: entityRef,
      user_entity_ref: userEntityRef,
      type,
    };
    await this.store.delete(data);
  }

  async deleteByUser(entityRef: string): Promise<void> {
    await this.store.deleteByUser(entityRef);
  }

  private dbToResponse(row: RawDbRow): SubscribeResponse {
    return {
      entityRef: row.entity_ref,
      userEntityRef: row.user_entity_ref,
      type: row.type,
    };
  }
}
