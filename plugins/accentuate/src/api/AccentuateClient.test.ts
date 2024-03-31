import { AccentuateClient, JsonSchema } from '../api';
import { schemas } from '../schemas';
import * as componentSchema from '../schemas/Component.v1alpha1.schema.json';

describe('AccentuateClient', () => {
  test('should return schema when kind found', async () => {
    const accentuateClient = new AccentuateClient({
      catalogApi: null as any,
      fetchApi: null as any,
      discoveryApi: null as any,
      identityApi: null as any,
      schemas: schemas,
    });

    const entity = {
      kind: 'Component',
      spec: {
        type: 'service',
      },
    } as unknown as any;

    const result = accentuateClient.getSchema(entity);

    expect(result!.schema).toMatchObject(componentSchema);
  });

  test('should return undefined if schema not found', async () => {
    const accentuateClient = new AccentuateClient({
      catalogApi: null as any,
      fetchApi: null as any,
      discoveryApi: null as any,
      identityApi: null as any,
      schemas: schemas,
    });

    const entity = {
      kind: 'Foo',
      spec: {
        type: 'service',
      },
    } as unknown as any;

    const result = accentuateClient.getSchema(entity);

    expect(result).toBeUndefined();
  });

  test('should return specific schema for type', async () => {
    const specificSchema = {
      kind: 'Component',
      type: 'service',
      schema: 'found',
      uiSchema: undefined,
    } as unknown as JsonSchema;
    const accentuateClient = new AccentuateClient({
      catalogApi: null as any,
      fetchApi: null as any,
      discoveryApi: null as any,
      identityApi: null as any,
      schemas: [...schemas, specificSchema],
    });

    const entity = {
      kind: 'Component',
      spec: {
        type: 'service',
      },
    } as unknown as any;

    const result = accentuateClient.getSchema(entity);

    expect(result?.schema).toEqual('found');
  });

  test('should return specific schema for type case insensitive', async () => {
    const specificSchema = {
      kind: 'Component',
      type: 'SERVICE',
      schema: 'found',
      uiSchema: undefined,
    } as unknown as JsonSchema;
    const accentuateClient = new AccentuateClient({
      catalogApi: null as any,
      fetchApi: null as any,
      discoveryApi: null as any,
      identityApi: null as any,
      schemas: [...schemas, specificSchema],
    });

    const entity = {
      kind: 'Component',
      spec: {
        type: 'service',
      },
    } as unknown as any;

    const result = accentuateClient.getSchema(entity);

    expect(result?.schema).toEqual('found');
  });

  test('should return general schema if not matching type', async () => {
    const specificSchema = {
      kind: 'Component',
      type: 'other',
      schema: 'found',
      uiSchema: undefined,
    } as unknown as JsonSchema;
    const accentuateClient = new AccentuateClient({
      catalogApi: null as any,
      fetchApi: null as any,
      discoveryApi: null as any,
      identityApi: null as any,
      schemas: [...schemas, specificSchema],
    });

    const entity = {
      kind: 'Component',
      spec: {
        type: 'service',
      },
    } as unknown as any;

    const result = accentuateClient.getSchema(entity);

    expect(result!.schema).toMatchObject(componentSchema);
  });
});
