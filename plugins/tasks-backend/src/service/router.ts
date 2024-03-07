import { errorHandler, PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { TasksBackendDatabase } from '../db';
import { TasksBackendClient, TasksBackendApi } from '../api';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { AuthenticationError } from '@backstage/errors';

/** @public */
export interface RouterOptions {
  tasksBackendApi?: TasksBackendApi;
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

  const tasksBackendStore = await TasksBackendDatabase.create(
    await database.getClient(),
  );

  const tasksBackendClient =
    routerOptions.tasksBackendApi ||
    new TasksBackendClient(logger, tasksBackendStore);

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' });
  });

  router.get('/', async (req, res) => {
    if (req.query.entityRef) {
      res
        .status(200)
        .json(
          await tasksBackendClient.getTasksByTarget(
            req.query.entityRef as string,
          ),
        );
    } else {
      res.status(200).json(await tasksBackendClient.getTasks());
    }
  });

  router.post('/', async (req, res) => {
    const taskId = await tasksBackendClient.createTask(req.body);
    res.status(201).json({ id: taskId });
  });

  router.put('/:taskId', async (req, res) => {
    const taskId = await tasksBackendClient.updateTask(req.body);
    res.status(200).json({ id: taskId });
  });

  router.delete('/:taskId', async (req, res) => {
    await tasksBackendClient.deleteTask(req.params.taskId);
    res.status(204).send();
  });

  router.post('/:taskId/tasks', async (req, res) => {
    const taskId = await tasksBackendClient.createSubTask(
      req.params.taskId,
      req.body,
    );
    res.status(201).json({ id: taskId });
  });

  router.put('/:taskId/tasks', async (req, res) => {
    const taskId = await tasksBackendClient.updateSubTask(
      req.params.taskId,
      req.body,
    );
    res.status(200).json({ id: taskId });
  });

  router.get('/me', async (req, res) => {
    const response = await identity.getIdentity({ request: req });
    if (response === undefined) {
      res
        .status(400)
        .json(new AuthenticationError('Could not find logged in user'));
    } else {
      res
        .status(200)
        .json(await tasksBackendClient.getMyTasks(response.identity));
    }
  });

  router.use(errorHandler());
  return router;
}

/** @public */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  return createRouter(routerOptions);
}
