import { ConfigApi, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { KongGatewayApi } from './KongGatewayApi';
import { KongGatewayClient } from './KongGatewayClient';

export class KongGatewayClientsFactory {

  public static fromConfig(options: {
    discoveryApi: DiscoveryApi,
    fetchApi: FetchApi,
    configApi: ConfigApi,
  }): Map<string, KongGatewayApi> {
    const { fetchApi, discoveryApi, configApi } = options;

    return new Map(configApi.getConfigArray('kongGateway.instances').map(instanceConfig => {
      return [instanceConfig.getString('name'), new KongGatewayClient({
        discoveryApi,
        fetchApi,
        managerUrl: instanceConfig.getOptionalString('managerUrl'),
        proxy: instanceConfig.getString('proxy'),
        oss: instanceConfig.getOptionalBoolean('oss') ?? true,
        name: instanceConfig.getString('name'),
      })];
    }));
  }

}
