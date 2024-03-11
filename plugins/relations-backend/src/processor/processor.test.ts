import { getVoidLogger } from '@backstage/backend-common';
import { RelationEntitiesProcessor } from './processor';
import { ProcessorConfig } from './processorConfig';
import { Entity } from '@backstage/catalog-model';

describe('processor', () => {
  test('should create return correct name', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => []),
      getSchema: jest.fn(),
    } as any;

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });

    expect(relationEntitiesProcessor.getProcessorName()).toEqual(
      'RelationEntitiesProcessor',
    );
  });

  test('should emit relations', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          targetKinds: 'user',
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: 'user:default/bruno',
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });
    await relationEntitiesProcessor.postProcessEntity(
      entity,
      null as any,
      mockEmit,
    );

    expect(mockEmit.mock.calls).toHaveLength(2);
    expect(mockEmit.mock.calls[0][0]).toMatchSnapshot();
    expect(mockEmit.mock.calls[1][0]).toMatchSnapshot();
  });

  test('should not emit relations if targetKind does not match', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          targetKinds: 'user',
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: 'group:default/team-a',
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });
    await relationEntitiesProcessor.postProcessEntity(
      entity,
      null as any,
      mockEmit,
    );

    expect(mockEmit.mock.calls).toHaveLength(0);
  });

  test('should emit relations when no targetKinds defined', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: 'user:default/bruno',
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });
    await relationEntitiesProcessor.postProcessEntity(
      entity,
      null as any,
      mockEmit,
    );

    expect(mockEmit.mock.calls).toHaveLength(2);
  });

  test('should emit multi relations', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          targetKinds: ['user'],
          attribute: 'test',
          multi: true,
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: ['user:default/bruno', 'user:default/kevin'],
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });
    await relationEntitiesProcessor.postProcessEntity(
      entity,
      null as any,
      mockEmit,
    );

    expect(mockEmit.mock.calls).toHaveLength(4);
  });

  test('should emit relations with defaults', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          targetKinds: ['user'],
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: 'bruno',
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });
    await relationEntitiesProcessor.postProcessEntity(
      entity,
      null as any,
      mockEmit,
    );

    expect(mockEmit.mock.calls).toHaveLength(2);
    expect(mockEmit.mock.calls[0][0].relation.target.kind).toEqual('user');
    expect(mockEmit.mock.calls[0][0].relation.target.namespace).toEqual(
      'default',
    );
    expect(mockEmit.mock.calls[0][0].relation.target.name).toEqual('bruno');
  });

  test('should not emit relations without defaults', async () => {
    const processorConfig: jest.Mocked<ProcessorConfig> = {
      getRelations: jest.fn(_ => [
        {
          sourceKind: 'component',
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
      ]),
      getSchema: jest.fn(),
    } as any;
    const entity = {
      kind: 'Component',
      metadata: {
        name: 'component-name',
        namespace: 'default',
      },
      spec: {
        test: 'bruno',
      },
    } as unknown as Entity;
    const mockEmit = jest.fn();

    const relationEntitiesProcessor = new RelationEntitiesProcessor({
      logger: getVoidLogger(),
      processorConfig,
    });

    await expect(
      relationEntitiesProcessor.postProcessEntity(
        entity,
        null as any,
        mockEmit,
      ),
    ).rejects.toThrow(Error);
  });
});
