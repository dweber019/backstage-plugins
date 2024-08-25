/** @public */
export type EntityMissingResults = {
  entityRef: string;
  missingEntityRefs: string[];
};

/** @public */
export type ProcessedEntity = {
  entityRef: string;
  processedDate: Date;
};

/** @public */
export type EntitiesOverview = {
  entityCount: number;
  processedCount: number;
  pendingCount: number;
  staleCount: number;
  filteredEntities: string[];
};

/** @public */
export type EntitiesPageResult = {
  overview: EntitiesOverview;
  entities: EntityMissingResults[];
};
