import { AccentuateEntitiesProcessor } from './processor';
import { ConfigReader } from '@backstage/config';
import { getVoidLogger } from '@backstage/backend-common';
import { AccentuateBackendClient } from '../api';
import { Entity } from '@backstage/catalog-model';
import { ANNOTATION_ACCENTUATE_DISABLE } from '@dweber019/backstage-plugin-accentuate-common';

const logger = getVoidLogger();
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
  test('should merge entity with stored data', async () => {
    function mockAccentuateBackendClient(): jest.Mocked<AccentuateBackendClient> {
      const mock = {
        get: jest
          .fn()
          .mockReturnValue({
            data: { spec: { owner: 'group:default/group-1' } },
          }),
      };
      return mock as unknown as jest.Mocked<AccentuateBackendClient>;
    }
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      accentuateBackendClient: mockAccentuateBackendClient(),
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
    function mockAccentuateBackendClient(): jest.Mocked<AccentuateBackendClient> {
      const mock = {
        get: jest
          .fn()
          .mockReturnValue({
            data: { spec: { owner: 'group:default/group-1' } },
          }),
      };
      return mock as unknown as jest.Mocked<AccentuateBackendClient>;
    }
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      accentuateBackendClient: mockAccentuateBackendClient(),
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
    function mockAccentuateBackendClient(): jest.Mocked<AccentuateBackendClient> {
      const mock = {
        get: jest.fn().mockReturnValue(undefined),
      };
      return mock as unknown as jest.Mocked<AccentuateBackendClient>;
    }
    const processor = new AccentuateEntitiesProcessor({
      logger,
      config,
      accentuateBackendClient: mockAccentuateBackendClient(),
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
