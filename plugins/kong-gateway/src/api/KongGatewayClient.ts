import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import { KongGatewayApi } from './KongGatewayApi';
import { Data, KongGatewayClientOptions, Plugin, Route, Service, Target, Upstream } from './types';

export class KongGatewayClient implements KongGatewayApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly managerUrl?: string;
  private readonly proxy: string;
  private readonly oss: boolean;
  private readonly name: string;

  public constructor(options: KongGatewayClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.managerUrl = options.managerUrl;
    this.proxy = options.proxy;
    this.oss = options.oss;
    this.name = options.name;
  }

  async getPlugin(pluginIdOrName: string, workspace?: string): Promise<Plugin> {
    return this.get<Plugin>(`plugins/${pluginIdOrName}`, workspace);
  }

  async getPlugins(workspace?: string): Promise<Plugin[]> {
    return this.getPaged<Plugin>('plugins', workspace);
  }

  async getPluginsOfRoute(routeIdOrName: string, workspace?: string): Promise<Plugin[]> {
    return this.getPaged<Plugin>(`routes/${routeIdOrName}/plugins`, workspace);
  }

  async getPluginsOfService(serviceIdOrName: string, workspace?: string): Promise<Plugin[]> {
    return this.getPaged<Plugin>(`services/${serviceIdOrName}/plugins`, workspace);
  }

  async getRoute(routeIdOrName: string, workspace?: string): Promise<Route> {
    return this.get<Route>(`routes/${routeIdOrName}`, workspace);
  }

  async getRoutes(workspace?: string): Promise<Route[]> {
    return this.getPaged<Route>('routes', workspace);
  }

  async getRoutesByService(serviceIdOrName: string, workspace?: string): Promise<Route[]> {
    return this.getPaged<Route>(`services/${serviceIdOrName}/routes`, workspace);
  }

  async getService(serviceIdOrName: string, workspace?: string): Promise<Service> {
    return this.get<Service>(`services/${serviceIdOrName}`, workspace);
  }

  async getServices(workspace?: string): Promise<Service[]> {
    return this.getPaged<Service>('services', workspace);
  }

  async getTargetsOfUpstream(upstreamIdOrName: string, workspace?: string): Promise<Target[]> {
    return this.getPaged<Target>(`upstreams/${upstreamIdOrName}/targets`, workspace);
  }

  async getUpstream(upstreamIdOrName: string, workspace?: string): Promise<Upstream> {
    return this.get<Upstream>(`upstreams/${upstreamIdOrName}`, workspace);
  }

  async getUpstreams(workspace?: string): Promise<Upstream[]> {
    return this.getPaged<Upstream>('upstreams', workspace);
  }

  private async get<T>(path: string, workspace?: string): Promise<T> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('proxy')}/${this.proxy}${this.getWorkspace(workspace)}`;
    const url = new URL(path, baseUrl);

    const response = await this.fetchApi.fetch(url.toString());

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }

  private async getPaged<T>(path: string, workspace?: string): Promise<T[]> {
    const baseUrl = `${await this.discoveryApi.getBaseUrl('proxy')}/${this.proxy}${this.getWorkspace(workspace)}`;
    const url = new URL(path, baseUrl);

    const response = await this.fetchApi.fetch(url.toString());

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    const jsonResponse = await response.json() as Data<T>;
    return jsonResponse.data as T[];
  }

  private getWorkspace(workspace?: string) {
    if (this.oss && workspace) {
      console.warn(`The instance ${this.name} is set to OSS but workspace ${workspace} provided, which is invalid for OSS.`);
      return '';
    }
    if (!this.oss && workspace && workspace.length > 0) {
      return `/${workspace}`;
    }
    return '/default';
  }
}
