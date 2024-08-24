import { DatabaseService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { SubscribeBackendDatabase } from '../db';
import { SubscribeBackendClient, SubscribeBackendApi } from '../api';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

/** @public */
export interface RouterOptions {
  subscribeBackendApi?: SubscribeBackendApi;
  database: DatabaseService;
  config?: Config;
}

/** @public */
export async function createRouter(
  routerOptions: RouterOptions,
): Promise<express.Router> {
  const { database } = routerOptions;

  const subscribeBackendStore = await SubscribeBackendDatabase.create(
    await database.getClient(),
  );

  const subscribeBackendClient =
    routerOptions.subscribeBackendApi ||
    new SubscribeBackendClient(subscribeBackendStore);

  const router = Router();
  router.use(express.json());

  router.get('/', async (req, res) => {
    if (req.query.entityRef && req.query.userEntityRef) {
      console.log(req.query)
      const result = await subscribeBackendClient.get(
        req.query.entityRef as string,
        req.query.userEntityRef as string,
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).send();
      }
    } else if (req.query.entityRef) {
      const result = await subscribeBackendClient.getByEntity(
        req.query.entityRef as string,
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).send();
      }
    } else if (req.query.userEntityRef) {
      const result = await subscribeBackendClient.getByUser(
        req.query.userEntityRef as string,
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).send();
      }
    } else {
      res.status(200).json(await subscribeBackendClient.getAll());
    }
  });

  router.put('/', async (req, res) => {
    const input = req.body as { entityRef: string, userEntityRef: string, type: string };
    if (
      input.entityRef === undefined ||
      input.userEntityRef === undefined ||
      input.type === undefined
    ) {
      res
        .status(400)
        .json(new InputError('Provide all required payload parameters'));
    } else {
      const accentuateResponse = await subscribeBackendClient.update(
        input.entityRef,
        input.userEntityRef,
        input.type,
      );
      res.status(200).json(accentuateResponse);
    }
  });

  router.delete('/', async (req, res) => {
    if (req.query.entityRef && req.query.userEntityRef && req.query.type) {
      await subscribeBackendClient.delete(
        req.query.entityRef as string,
        req.query.userEntityRef as string,
        req.query.type as string,
      );
      res.status(204).send();
    } else if (req.query.userEntityRef) {
      await subscribeBackendClient.deleteByUser(
        req.query.userEntityRef as string,
      );
      res.status(204).send();
    } else {
      res
        .status(400)
        .json(
          new InputError('You have to provide the entityRef query parameter'),
        );
    }
  });

  return router;
}

/** @public */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  return createRouter(routerOptions);
}
