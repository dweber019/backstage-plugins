export interface Config {
  relationsProcessor: {
    /**
     * A list relation definitions.
     * @visibility frontend
     */
    relations: {
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
