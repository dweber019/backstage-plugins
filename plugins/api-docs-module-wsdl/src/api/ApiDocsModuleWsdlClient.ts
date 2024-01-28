import { ResponseError } from '@backstage/errors';
import { ApiDocsModuleWsdlApi } from './types';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

/**
 * Options for creating a client.
 *
 * @public
 */
export interface ClientOptions {
  discoveryApi: DiscoveryApi;
  identityApi: IdentityApi;
}

/**
 * An implementation of the ApiDocsModuleWsdlDocClientApi that talks to the plugin backend.
 *
 * @public
 */
export class ApiDocsModuleWsdlClient implements ApiDocsModuleWsdlApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;

  constructor(options: ClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
  }

  async convert(xml: string, entityRef: string): Promise<string> {
    const baseUrl = await this.discoveryApi.getBaseUrl('api-docs-module-wsdl');
    const { token } = await this.identityApi.getCredentials();

    const res = await fetch(`${baseUrl}/v1/convert?entityRef=${entityRef}`, {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      body: xml,
    });

    if (!res.ok) {
      throw await ResponseError.fromResponse(res);
    }

    return res.text();
  }
}
