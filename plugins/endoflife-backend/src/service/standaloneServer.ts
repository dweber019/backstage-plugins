import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';
import { MockCacheClient } from '../../dev/MockCacheClient';
import { MockUrlReader } from '../../dev/MockedUrlReader';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'endoflife-backend',
  });
  logger.info('Starting application server...');
  const router = await createRouter({
    reader: new MockUrlReader(),
    cacheClient: new MockCacheClient(),
    logger,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/api/endoflife', router);
  if (options.enableCors) {
    logger.info('CORS is enabled, limiting to localhost with port 3000');
    service = service.enableCors({ origin: 'http://localhost:3000' });
  } else {
    logger.info('CORS is disabled, allowing all origins');
    service = service.enableCors({ origin: '*' });
  }

  return await service.start().catch((err: any) => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
