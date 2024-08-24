import { AccentuateBackendStore } from '../db';
import { JsonObject } from '@backstage/types';
import { RawDbRow } from '../db/AccentuateBackendDatabase';
import { DateTime } from 'luxon';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface AccentuateResponse {
  entityRef: string;
  data: JsonObject;
  changedAt: string;
  changedBy: string;
}

/** @public */
export interface AccentuateBackendApi {
  getAll(): Promise<AccentuateResponse[]>;
  get(entityRef: string): Promise<AccentuateResponse | undefined>;
  update(
    entityRef: string,
    data: JsonObject,
    changedBy: string,
  ): Promise<AccentuateResponse>;
  delete(entityRef: string): Promise<void>;
}

/** @public */
export class AccentuateBackendClient implements AccentuateBackendApi {
  // @ts-ignore
  private readonly logger: LoggerService;
  private readonly store: AccentuateBackendStore;
  public constructor(logger: LoggerService, store: AccentuateBackendStore) {
    this.logger = logger;
    this.store = store;
  }

  async getAll(): Promise<AccentuateResponse[]> {
    const rawDbRows = await this.store.getAll();
    return rawDbRows.map(rawDbRow => this.dbToResponse(rawDbRow));
  }

  async update(
    entityRef: string,
    data: JsonObject,
    changedBy: string,
  ): Promise<AccentuateResponse> {
    const insetData = {
      entity_ref: entityRef,
      data: JSON.stringify(data),
      changed_at: DateTime.now().toFormat('yyyy-MM-dd TT'),
      changed_by_entity_ref: changedBy,
    };
    await this.store.insert(insetData);
    return this.dbToResponse(insetData);
  }

  async get(entityRef: string): Promise<AccentuateResponse | undefined> {
    const rawDbRow = await this.store.get(entityRef);
    return rawDbRow && this.dbToResponse(rawDbRow);
  }

  async delete(entityRef: string): Promise<void> {
    await this.store.delete(entityRef);
  }

  private dbToResponse(row: RawDbRow): AccentuateResponse {
    return {
      entityRef: row.entity_ref,
      data: JSON.parse(row.data),
      changedAt: row.changed_at,
      changedBy: row.changed_by_entity_ref,
    };
  }
}
