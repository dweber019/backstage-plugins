import { errorHandler, PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { AccentuateBackendDatabase } from '../db';
import { AccentuateBackendClient, AccentuateBackendApi } from '../api';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { AccentuateInput } from '@dweber019/backstage-plugin-accentuate-common';

/** @public */
export interface RouterOptions {
  accentuateBackendApi?: AccentuateBackendApi;
  logger: Logger;
  database: PluginDatabaseManager;
  identity: IdentityApi;
  config?: Config;
}

/** @public */
export async function createRouter(
  routerOptions: RouterOptions,
): Promise<express.Router> {
  const { logger, database, identity } = routerOptions;

  const accentuateBackendStore = await AccentuateBackendDatabase.create(
    await database.getClient(),
  );

  const accentuateBackendClient =
    routerOptions.accentuateBackendApi ||
    new AccentuateBackendClient(logger, accentuateBackendStore);

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' });
  });

  router.get('/', async (req, res) => {
    if (req.query.entityRef) {
      const result = await accentuateBackendClient.get(
        req.query.entityRef as string,
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(200).json(await accentuateBackendClient.getAll());
    }
  });

  router.put('/', async (req, res) => {
    const identityResponse = await identity.getIdentity({ request: req });

    const accentuateInput = req.body as AccentuateInput;
    if (
      accentuateInput.entityRef === undefined ||
      accentuateInput.data === undefined
    ) {
      res
        .status(400)
        .json(new InputError('Provide all required payload parameters'));
    } else {
      const accentuateResponse = await accentuateBackendClient.update(
        accentuateInput.entityRef,
        accentuateInput.data,
        identityResponse ? identityResponse.identity.userEntityRef : 'unknown',
      );
      res.status(200).json(accentuateResponse);
    }
  });

  router.delete('/', async (req, res) => {
    if (req.query.entityRef === undefined) {
      res
        .status(400)
        .json(
          new InputError('You have to provide the entityRef query parameter'),
        );
    } else {
      await accentuateBackendClient.delete(req.query.entityRef as string);
      res.status(204).send();
    }
  });

  router.use(errorHandler());
  return router;
}

/** @public */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  return createRouter(routerOptions);
}
