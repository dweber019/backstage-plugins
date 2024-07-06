import { createRouter } from '@dweber019/backstage-plugin-accentuate-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
    identity: env.identity,
  });
}
