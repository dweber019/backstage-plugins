import {
  coreServices,
  createBackendModule, createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { SubscribeEventRouter } from './router';
import { notificationService } from '@backstage/plugin-notifications-node';
import { createRouter } from './service/router';

export const eventsModuleSubscribe = createBackendModule({
  pluginId: 'events',
  moduleId: 'subscribe-event-consumer',
  register(env) {
    env.registerInit({
      deps: {
        events: eventsServiceRef,
        logger: coreServices.logger,
        notificationService: notificationService,
      },
      async init({ events, logger, notificationService, }) {
        const eventRouter = new SubscribeEventRouter({
          logger,
          events,
          notificationService,
        });
        await eventRouter.subscribe();
      },
    });
  },
});

export const subscribePlugin = createBackendPlugin({
  pluginId: 'subscribe',
  register(env) {
    env.registerInit({
      deps: {
        database: coreServices.database,
        httpRouter: coreServices.httpRouter,
      },
      async init({ database, httpRouter, }) {
        httpRouter.use(
          await createRouter({
            database
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
