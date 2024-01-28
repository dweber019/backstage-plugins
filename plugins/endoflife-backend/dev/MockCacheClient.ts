import { CacheClient } from '@backstage/backend-common';

export class MockCacheClient implements CacheClient {
  private readonly itemRegistry: { [key: string]: any };

  constructor() {
    this.itemRegistry = {};
  }

  async get(key: string) {
    return this.itemRegistry[key];
  }

  async set(key: string, value: any) {
    this.itemRegistry[key] = value;
  }

  async delete(key: string) {
    delete this.itemRegistry[key];
  }

  withOptions = () => this;
}
