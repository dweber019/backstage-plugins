import { JsonObject } from '@backstage/types';

/** @public */
export interface AccentuateResponse {
  entityRef: string;
  data: JsonObject;
  changedAt: string;
  changedBy: string;
}

/** @public */
export interface AccentuateInput {
  entityRef: string;
  data: JsonObject;
}

/** @public */
export interface ConfigAllowedKind {
  kind: string;
  specType?: string;
}
