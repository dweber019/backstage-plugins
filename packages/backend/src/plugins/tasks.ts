import { createRouter } from '@dweber019/backstage-plugin-tasks-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return createRouter({ ...env });
}
