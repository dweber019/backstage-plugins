export interface Config {
  entityChangedProcessor?: {
    /**
     * A list ignored attributes for the entity.
     * This strings must be compatible with https://lodash.com/docs/4.17.15#has path input.
     */
    ignoreAttribute?: string[];
  };
}
