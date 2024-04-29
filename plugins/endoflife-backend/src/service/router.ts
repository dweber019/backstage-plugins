import { CacheClient, UrlReader } from '@backstage/backend-common';
import { NotModifiedError, stringifyError } from '@backstage/errors';
import { Logger } from 'winston';
import express from 'express';
import Router from 'express-promise-router';

/** @public */
export type EndOfLifeRouterOptions = {
  reader: UrlReader;
  cacheClient: CacheClient;
  logger: Logger;
};

/** @public */
export async function createRouter(
  options: EndOfLifeRouterOptions,
): Promise<express.Router> {
  const { reader, cacheClient, logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/file', async (req, res) => {
    const urlToProcess = req.query.url as string;
    if (!urlToProcess) {
      res.statusCode = 400;
      res.json({ message: 'No URL provided' });
      return;
    }

    const cachedFileContent = (await cacheClient.get(urlToProcess)) as {
      data: string;
      etag: string;
    };

    try {
      const fileGetResponse = await reader.readUrl(urlToProcess, {
        etag: cachedFileContent?.etag,
      });
      const fileBuffer = await fileGetResponse.buffer();
      const data = fileBuffer.toString();

      await cacheClient.set(urlToProcess, {
        data,
        etag: fileGetResponse.etag,
      });
      res.send(data);
    } catch (error: any) {
      if (cachedFileContent && error.name === NotModifiedError.name) {
        res.json({ data: cachedFileContent.data });
        return;
      }

      const message = stringifyError(error);
      logger.error(`Unable to fetch file from ${urlToProcess}: ${message}`);
      res.statusCode = 500;
      res.json({ message });
    }
  });

  return router;
}
