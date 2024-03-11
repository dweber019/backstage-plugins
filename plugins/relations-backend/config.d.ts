export interface Config {
  relationsProcessor: {
    /**
     * A list relation definitions.
     * @visibility frontend
     */
    relations: {
      /**
       * The Kind of entities the relation applies to, e.g. group, user, component.
       */
      sourceKind: string;
      /**
       * The `spec.type` as a filter option for the relation.
       */
      sourceType?: string;
      /**
       * The Kinds of entities the relation allows as a target, e.g. group, user, component.
       * Allows any entity Kind if not defined.
       */
      targetKinds?: string[];
      /**
       * The attribute used at `spec.<attribute>` on the sourceKind for the relation.
       */
      attribute: string;
      /**
       * If the value of the `attribute` is a `string` or `string[]`. Defaults to false.
       */
      multi?: boolean;
      /**
       * Definition of relation pairs used to express the relation.
       * @visibility frontend
       */
      pairs: {
        /**
         * The incoming relation name from target to source.
         * @visibility frontend
         */
        incoming: string;
        /**
         * The outgoing relation name from source to target.
         * @visibility frontend
         */
        outgoing: string;
      }[];
    }[];
  };
}
