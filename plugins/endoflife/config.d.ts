export interface Config {
  endOfLife?: {
    /**
     * Provide a custom help text
     * @visibility frontend
     */
    helpText?: string;
    /**
     * Url of the end-of-life service
     * @visibility frontend
     *
     * @default https://endoflife.date
     */
    baseUrl? string;
  };
}
