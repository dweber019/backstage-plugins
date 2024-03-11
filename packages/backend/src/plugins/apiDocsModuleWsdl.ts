import { Router } from 'express';
import { createRouter } from '@dweber019/backstage-plugin-api-docs-module-wsdl-backend';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({ logger: env.logger, discovery: env.discovery, tokenManager: env.tokenManager });
}
