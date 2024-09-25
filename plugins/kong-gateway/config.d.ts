export interface Config {
  kongGateway?: {
    /** @visibility frontend */
    instances: {
      /** @visibility frontend */
      name: string;
      /** @visibility frontend */
      proxy: string;
      /** @visibility frontend */
      managerUrl?: string;
      /** @visibility frontend */
      oss: boolean;
    }[];
  };
}
