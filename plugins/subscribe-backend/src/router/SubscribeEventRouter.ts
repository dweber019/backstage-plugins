import {
  EventParams,
  EventsService,
} from '@backstage/plugin-events-node';
import { LoggerService } from '@backstage/backend-plugin-api';
import { NotificationService } from '@backstage/plugin-notifications-node';
import { parseEntityRef } from '@backstage/catalog-model';

export class SubscribeEventRouter {
  private readonly logger: LoggerService;
  private readonly events: EventsService;
  private readonly notificationService: NotificationService;

  constructor(options: { events: EventsService, logger: LoggerService, notificationService: NotificationService }) {
    this.logger = options.logger;
    this.events = options.events;
    this.notificationService = options.notificationService;
  }

  public async subscribe() {
    await this.events.subscribe({
      id: 'SubscribeEventRouter',
      topics: ['entityChanged'],
      onEvent: (params) => this.onEvent(params as any),
    });
  }

  private async onEvent(params: EventParams<{ aspect: string, entityRef: string }>) {
    this.logger.info('Event received', {
      topic: params.topic,
      payload: JSON.stringify(params.eventPayload),
    });
    const compoundEntityRef = parseEntityRef(params.eventPayload.entityRef);
    switch (params.eventPayload.aspect) {
      case 'entity':
        await this.notificationService.send({
          recipients: { type: 'broadcast' },
          payload: {
            title: `Entity ${params.eventPayload.entityRef} changed`,
            description: 'This entity has changed in some form and you should take a look at it',
            link: `/catalog/${compoundEntityRef.namespace}/${compoundEntityRef.kind}/${compoundEntityRef.name}`,
            topic: 'entityChanged',
            icon: 'catalog',
          },
        });
        break;
    }
  }
}
