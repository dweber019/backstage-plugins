import express from 'express';
import Router from 'express-promise-router';
import fetch from 'cross-fetch';
import { CatalogClient } from '@backstage/catalog-client';
import {
  createLegacyAuthAdapters,
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { ApiEntity } from '@backstage/catalog-model';
// @ts-ignore
import SaxonJS from 'saxon-js';
import styleSheet from '../stylesheet.sef.json';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';

const downloadExternalSchema = async (uri: string, logger: LoggerService) => {
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
  logger: LoggerService,
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
      externalSchemas.map(async (document: any) =>
        recursiveDocumentPoolDownload(document, logger, documentPool),
      ),
    );
  }

  return documentPool;
};

const wsdlToHtml = async (xml: string, logger: LoggerService) => {
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

export interface RouterOptions {
  logger: LoggerService;
  discovery: PluginEndpointDiscovery;
  tokenManager: TokenManager;
  auth?: AuthService;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, discovery, tokenManager, auth } = options;

  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const { auth: adaptedAuth } = createLegacyAuthAdapters({
    auth,
    tokenManager: tokenManager,
    discovery: discovery,
  });

  const router = Router();
  router.use(express.text());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/v1/convert', async (req, res) => {
    const { token } = await adaptedAuth.getPluginRequestToken({
      onBehalfOf: await adaptedAuth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });
    const entityRef = req.query.entityRef as string;
    const entityLogger = logger.child({ entity: entityRef });
    const apiEntity = (await catalogClient.getEntityByRef(entityRef, {
      token,
    })) as ApiEntity;
    const result = await wsdlToHtml(apiEntity.spec.definition, entityLogger);
    res.send(result);
  });

  return router;
}
