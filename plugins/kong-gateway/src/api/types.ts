import { JsonObject } from '@backstage/types';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export interface KongGatewayClientOptions {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  managerUrl?: string;
  proxy: string;
  oss: boolean;
  name: string;
}

export interface Data<T> {
  data: T[];
  next: string;
}

export interface Plugin {
  id: string;
  name: string;
  create_at: number;
  route?: string;
  service?: string;
  consumer?: string;
  config?: JsonObject;
  protocols: string[];
  enabled: boolean;
  tags: string[];
  ordering?: JsonObject;
}

export interface Route {
  hosts: string[];
  id: string;
  name: string;
  paths: string[];
  service: {
    id: string;
  }
}

export interface Service {
  host: string;
  id: string;
  name: string;
  path: string;
  port: number;
  protocol: string;
}

export interface Upstream {
  algorithm: string;
  hash_fallback: string;
  hash_on: string;
  hash_on_cookie_path: string;
  healthchecks: JsonObject;
  id: string;
  name: string;
  slots: number;
}

export interface Target {
  id: string;
  target: string;
  upstream: {
    id: string;
  }
  weight: number;
}
