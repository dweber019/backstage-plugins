import { createApiRef } from '@backstage/core-plugin-api';
import { Plugin, Route, Service, Target, Upstream } from './types';

export const kongGatewayApiRef = createApiRef<Map<string, KongGatewayApi>>({
  id: 'plugin.kong-gateway.service',
});

export interface KongGatewayApi {
  getTargetsOfUpstream(upstreamIdOrName: string, workspace?: string): Promise<Target[]>;
  getUpstreams(workspace?: string): Promise<Upstream[]>;
  getUpstream(upstreamIdOrName: string, workspace?: string): Promise<Upstream>;
  getServices(workspace?: string): Promise<Service[]>;
  getService(serviceIdOrName: string, workspace?: string): Promise<Service>;
  getRoutesByService(serviceIdOrName: string, workspace?: string): Promise<Route[]>;
  getRoutes(workspace?: string): Promise<Route[]>;
  getRoute(routeIdOrName: string, workspace?: string): Promise<Route>;
  getPluginsOfRoute(routeIdOrName: string, workspace?: string): Promise<Plugin[]>;
  getPluginsOfService(serviceIdOrName: string, workspace?: string): Promise<Plugin[]>;
  getPlugins(workspace?: string): Promise<Plugin[]>;
  getPlugin(pluginIdOrName: string, workspace?: string): Promise<Plugin>;
}
