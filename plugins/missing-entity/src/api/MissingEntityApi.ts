import { createApiRef } from '@backstage/core-plugin-api';
import { EntitiesPageResult, EntityMissingResults } from '@dweber019/backstage-plugin-missing-entity-common';

export const missingEntityApiRef = createApiRef<MissingEntityApi>({
  id: 'plugin.missing-entity.service',
});

export interface MissingEntityApi {
  getMissingEntities(entityRef: string, refresh: boolean): Promise<EntityMissingResults>;
  getAllMissingEntities(onlyWithMissing: boolean, owner: string | undefined): Promise<EntitiesPageResult>;
}
