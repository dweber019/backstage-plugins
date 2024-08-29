import { AccentuateEntitiesProcessor } from './processor';
import { ConfigReader } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';
import { ANNOTATION_ACCENTUATE_DISABLE } from '@dweber019/backstage-plugin-accentuate-common';
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { registerMswTestHooks } from '@backstage/test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const logger = mockServices.logger.mock();
const config = new ConfigReader({
  accentuate: {
    allowedKinds: [
      {
        kind: 'Component',
      },
      {
        kind: 'Group',
      },
    ],
  },
});

describe('processor', () => {
  const server = setupServer();
  registerMswTestHooks(server);

  const discovery = mockServices.discovery.mock({
    getBaseUrl: jest.fn().mockResolvedValue('http://example.com'),
  });
  const auth = mockServices.auth();

  test('should merge entity with stored data', async () => {
    server.use(
      rest.get('http://example.com', async (req, res, ctx) => {
        expect(req.headers.get('Authorization')).toBe(
          mockCredentials.service.header({
            onBehalfOf: await auth.getOwnServiceCredentials(),
            targetPluginId: 'accentuate',
          }),
        );
        return res(ctx.json({
          data: { spec: { owner: 'group:default/group-1' } },
        }));
      }),
    );
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      discovery,
      auth,
    });

    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-1',
        namespace: 'default',
      },
      spec: {
        type: 'service',
      },
    } as unknown as Entity;

    const entityResult = await processor.preProcessEntity(entity);

    expect(entityResult).toMatchObject({
      spec: {
        type: 'service',
        owner: 'group:default/group-1',
      },
    });
  });

  test('should not merge entity if not allowed kind', async () => {
    server.use(
      rest.get('http://example.com', async (req, res, ctx) => {
        expect(req.headers.get('Authorization')).toBe(
          mockCredentials.service.header({
            onBehalfOf: await auth.getOwnServiceCredentials(),
            targetPluginId: 'accentuate',
          }),
        );
        return res(ctx.json({
          data: { spec: { owner: 'group:default/group-1' } },
        }));
      }),
    );
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      discovery,
      auth,
    });

    const entity = {
      kind: 'user',
      metadata: {
        name: 'user-1',
        namespace: 'default',
      },
      spec: {},
    } as unknown as Entity;

    const entityResult = await processor.preProcessEntity(entity);

    expect(entityResult).toMatchObject({
      metadata: {
        annotations: {
          [ANNOTATION_ACCENTUATE_DISABLE]: 'true',
        },
      },
      spec: {},
    });
  });

  test('should not merge entity if nothing found', async () => {
    server.use(
      rest.get('http://example.com', async (req, res, ctx) => {
        expect(req.headers.get('Authorization')).toBe(
          mockCredentials.service.header({
            onBehalfOf: await auth.getOwnServiceCredentials(),
            targetPluginId: 'accentuate',
          }),
        );
        return res(ctx.status(404));
      }),
    );
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      discovery,
      auth,
    });

    const entity = {
      kind: 'user',
      metadata: {
        name: 'user-1',
        namespace: 'default',
      },
      spec: {},
    } as unknown as Entity;

    const entityResult = await processor.preProcessEntity(entity);

    expect(entityResult).toMatchObject(entity);
  });
});
