import { createApiRef } from '@backstage/core-plugin-api';
import { JsonSchema } from './AccentuateClient';
import { AccentuateResponse } from '@dweber019/backstage-plugin-accentuate-common';
import { JsonObject } from '@backstage/types';
import { Entity } from '@backstage/catalog-model';

/** @public */
export interface AccentuateApi {
  /** @public */
  getAll(): Promise<AccentuateResponse[]>;
  /** @public */
  get(entityRef: string): Promise<AccentuateResponse | undefined>;
  /** @public */
  update(entityRef: string, data: JsonObject): Promise<AccentuateResponse>;
  /** @public */
  delete(entityRef: string): Promise<void>;
  /** @public */
  getSchema(entity: Entity): JsonSchema | undefined;
  /** @public */
  refresh(entityRef: string): Promise<void>;
}

/** @public */
export const accentuateApiRef = createApiRef<AccentuateApi>({
  id: 'plugin.accentuate.api',
});
