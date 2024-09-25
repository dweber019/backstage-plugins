import express from 'express';
import Router from 'express-promise-router';
import { AccentuateBackendDatabase } from '../db';
import { AccentuateBackendClient, AccentuateBackendApi } from '../api';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { AccentuateInput } from '@dweber019/backstage-plugin-accentuate-common';
import { DatabaseService, HttpAuthService, LoggerService, UserInfoService } from '@backstage/backend-plugin-api';

/** @public */
export interface RouterOptions {
  accentuateBackendApi?: AccentuateBackendApi;
  logger: LoggerService;
  database: DatabaseService;
  userInfo: UserInfoService;
  httpAuth: HttpAuthService;
  config?: Config;
}

/** @public */
export async function createRouter(
  routerOptions: RouterOptions,
): Promise<express.Router> {
  const { logger, database, httpAuth, userInfo } = routerOptions;

  const accentuateBackendStore = await AccentuateBackendDatabase.create(
    await database.getClient(),
  );

  const accentuateBackendClient =
    routerOptions.accentuateBackendApi ||
    new AccentuateBackendClient(logger, accentuateBackendStore);

  const router = Router();
  router.use(express.json());

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
    const credentials = await httpAuth.credentials(req);
    const info = await userInfo.getUserInfo(credentials);

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
        info ? info.userEntityRef : 'unknown',
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

  return router;
}

/** @public */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  return createRouter(routerOptions);
}
