export interface Config {
  accentuate?: {
    /**
     * The kinds allowed to be accentuated
     * @visibility frontend
     */
    allowedKinds?: {
      kind: string;
      specType?: string;
    }[];
  };
}
