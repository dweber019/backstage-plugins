import express from 'express';
import Router from 'express-promise-router';
import fetch from 'cross-fetch';
import { Logger } from 'winston';
// @ts-ignore
import SaxonJS from 'saxon-js';
import styleSheet from '../stylesheet.sef.json';

export interface RouterOptions {
  logger: Logger;
}

const downloadExternalSchema = async (uri: string, logger: Logger) => {
  try {
    const value = await fetch(uri);
    return await value.text();
  } catch {
    logger.warn(`Error downloading schema for ${uri}`);
    return `<?xml version="1.0" encoding="UTF-8"?><Error>Could not download external schema!</Error>`;
  }
};

// Do to a bug in SaxonJS we have to remove the port else the
// document can't be found by the URL in the documentPool.
const removePort = (uri: string) => {
  const url = new URL(uri);
  if (
    (url.protocol.toLowerCase() === 'https' &&
      url.port.toLowerCase() === '443') ||
    (url.protocol.toLowerCase() === 'http' && url.port.toLowerCase() === '80')
  ) {
    url.port = '';
  }
  return url.toString();
};

const recursiveDocumentPoolDownload = async (
  saxonDocument: any,
  logger: Logger,
  documentPool: { [name: string]: string } = {},
) => {
  const schemaURIs: Array<{ value: string }> =
    SaxonJS.XPath.evaluate(
      "//*[local-name() = 'import'][@location]/@location|//*[@schemaLocation]/@schemaLocation",
      saxonDocument,
      { resultForm: 'array' },
    ) || [];

  if (schemaURIs.length > 0) {
    const externalSchemas = await Promise.all(
      schemaURIs.map(async schemaURI =>
        SaxonJS.getResource({
          text: await downloadExternalSchema(schemaURI.value, logger),
          type: 'xml',
        }),
      ),
    );

    for (let i = 0; i < externalSchemas.length; i++) {
      documentPool[removePort(schemaURIs[i].value)] = externalSchemas[i];
    }

    await Promise.all(
      externalSchemas.map(async document =>
        recursiveDocumentPoolDownload(document, logger, documentPool),
      ),
    );
  }

  return documentPool;
};

const wsdlToHtml = async (xml: string, logger: Logger) => {
  const saxonDocument = await SaxonJS.getResource({ text: xml, type: 'xml' });
  const documentPool: { [name: string]: string } =
    await recursiveDocumentPoolDownload(saxonDocument, logger);

  const schemaURIs = Object.keys(documentPool);
  if (schemaURIs.length > 0) {
    logger.info(
      `Downloading external schemas as found ${schemaURIs.length} external schemas.`,
    );
    logger.info(`External schemas ${schemaURIs.join(', ')}`);
  } else {
    logger.info('No external schema found');
  }

  logger.info('Transforming wsdl document');

  return SaxonJS.transform(
    {
      stylesheetText: JSON.stringify(styleSheet),
      sourceText: xml,
      sourceBaseURI: 'https://backstage.io', // Needs to be set to anything
      documentPool: documentPool,
      destination: 'serialized',
      logLevel: 10,
    },
    'async',
  ).then((output: { principalResult: string }) => output.principalResult);
};

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const router = Router();
  router.use(express.text());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post('/v1/convert', async (req, res) => {
    const entityLogger = logger.child({ entity: req.query.entityRef });
    const result = await wsdlToHtml(req.body.toString(), entityLogger);
    res.send(result);
  });

  return router;
}
