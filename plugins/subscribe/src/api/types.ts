import { createApiRef } from '@backstage/core-plugin-api';

export interface SubscribeResponse {
  entityRef: string;
  userEntityRef: string;
  type: string;
}

/** @public */
export interface SubscribeApi {
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
export const subscribeApiRef = createApiRef<SubscribeApi>({
  id: 'plugin.subscribe.api',
});
