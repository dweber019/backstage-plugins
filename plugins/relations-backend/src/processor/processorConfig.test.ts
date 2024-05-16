import { ConfigReader } from '@backstage/config';
import { ProcessorConfig } from './processorConfig';
import { Entity } from '@backstage/catalog-model';

describe('processorConfig', () => {
  test('should create correct schema', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            attribute: 'owner',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
          {
            sourceKind: 'resource',
            attribute: 'test',
            multi: true,
            pairs: [
              {
                incoming: 'testOf',
                outgoing: 'testBy',
              },
            ],
          },
        ],
      },
    });

    const processorConfig = new ProcessorConfig(config);
    const schema = processorConfig.getSchema();

    expect(schema.allOf[1].properties?.kind.enum).toContain('component');
    expect(schema.allOf[1].properties?.kind.enum).toContain('resource');
    expect(schema.allOf[1].properties?.spec.properties).toMatchObject({
      owner: { type: 'string' },
    });
    expect(schema.allOf[1].properties?.spec.properties).toMatchObject({
      test: { type: 'array', items: { type: 'string' } },
    });
  });

  test('should allow for multiple sourceKind mappings without creating an invalid schema', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            attribute: 'owner',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
          {
            sourceKind: 'component',
            attribute: 'test',
            multi: true,
            pairs: [
              {
                incoming: 'testOf',
                outgoing: 'testBy',
              },
            ],
          },
          {
            sourceKind: 'group',
            attribute: 'leader',
            pairs: [
              {
                incoming: 'leaderOf',
                outgoing: 'leadBy',
              },
            ],
          },
        ],
      },
    });

    const processorConfig = new ProcessorConfig(config);
    const schema = processorConfig.getSchema();

    expect(schema.allOf[1].properties?.kind.enum).toHaveLength(2);
    expect(schema.allOf[1].properties?.kind.enum).toContain('component');
    expect(schema.allOf[1].properties?.kind.enum).toContain('group');
  });

  test('should return only test relation', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            attribute: 'owner',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
          {
            sourceKind: 'component',
            attribute: 'test',
            multi: true,
            pairs: [
              {
                incoming: 'testOf',
                outgoing: 'testBy',
              },
            ],
          },
        ],
      },
    });
    const entity = {
      kind: 'Component',
      spec: {
        test: 'any',
      },
    } as unknown as Entity;

    const processorConfig = new ProcessorConfig(config);
    const relations = processorConfig.getRelations(entity);

    expect(relations).toHaveLength(1);
  });

  test('should ignore not matched spec.type relation', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            attribute: 'owner',
            sourceType: 'app',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
          {
            sourceKind: 'component',
            attribute: 'test',
            multi: true,
            pairs: [
              {
                incoming: 'testOf',
                outgoing: 'testBy',
              },
            ],
          },
        ],
      },
    });
    const entity = {
      kind: 'Component',
      spec: {
        type: 'notApp',
        owner: 'any',
        test: 'any',
      },
    } as unknown as Entity;

    const processorConfig = new ProcessorConfig(config);
    const relations = processorConfig.getRelations(entity);

    expect(relations).toHaveLength(1);
  });

  test('should return matched spec.type relation', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            attribute: 'owner',
            sourceType: 'app',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
          {
            sourceKind: 'component',
            attribute: 'test',
            multi: true,
            pairs: [
              {
                incoming: 'testOf',
                outgoing: 'testBy',
              },
            ],
          },
        ],
      },
    });
    const entity = {
      kind: 'Component',
      spec: {
        type: 'app',
        owner: 'any',
        test: 'any',
      },
    } as unknown as Entity;

    const processorConfig = new ProcessorConfig(config);
    const relations = processorConfig.getRelations(entity);

    expect(relations).toHaveLength(2);
  });

  test('should throw error for config errors', async () => {
    const config = new ConfigReader({
      relationsProcessor: {
        relations: [
          {
            sourceKind: 'Component',
            // attribute: 'owner',
            pairs: [
              {
                incoming: 'ownerOf',
                outgoing: 'ownerBy',
              },
            ],
          },
        ],
      },
    });

    const t = () => {
      return new ProcessorConfig(config);
    };

    expect(t).toThrow(Error);
  });
});
