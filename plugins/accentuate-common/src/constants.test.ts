import { Entity } from '@backstage/catalog-model';
import {
  DEFAULT_ALLOWED_KINDS,
  isAccentuateEnabled,
  isAllowedKind,
} from './constants';

describe('constants', () => {
  test('should have all backstage built in kind enabled', async () => {
    expect(DEFAULT_ALLOWED_KINDS).toMatchObject([
      { kind: 'User' },
      { kind: 'Group' },
      { kind: 'Component' },
      { kind: 'Resource' },
      { kind: 'API' },
      { kind: 'System' },
      { kind: 'Domain' },
    ]);
  });

  test('should check if entity is accentuate enabled', async () => {
    let entity = {
      metadata: {
        annotations: {
          'accentuate/disable': false,
        },
      },
    } as unknown as Entity;
    expect(isAccentuateEnabled(entity)).toBeTruthy();

    entity = {
      metadata: {
        annotations: {
          'accentuate/disable': 'false',
        },
      },
    } as unknown as Entity;
    expect(isAccentuateEnabled(entity)).toBeFalsy();

    entity = {
      metadata: {
        annotations: {
          'accentuate/disable': true,
        },
      },
    } as unknown as Entity;
    expect(isAccentuateEnabled(entity)).toBeFalsy();

    entity = {
      metadata: {
        annotations: {
          'accentuate/disable': 'true',
        },
      },
    } as unknown as Entity;
    expect(isAccentuateEnabled(entity)).toBeFalsy();
  });

  test('should return true if entity is allowed', async () => {
    const entity = {
      kind: 'Group',
      spec: {
        type: '',
      },
    } as unknown as Entity;
    expect(isAllowedKind(entity, DEFAULT_ALLOWED_KINDS)).toBeTruthy();
  });

  test('should return false if entity is not allowed', async () => {
    const entity = {
      kind: 'Group',
      spec: {
        type: '',
      },
    } as unknown as Entity;
    const allowedKinds = [
      { kind: 'User' },
      { kind: 'Component' },
      { kind: 'Resource' },
      { kind: 'API' },
      { kind: 'System' },
      { kind: 'Domain' },
    ];
    expect(isAllowedKind(entity, allowedKinds)).toBeFalsy();
  });

  test('should return true if entity with specific type is allowed', async () => {
    const entity = {
      kind: 'Group',
      spec: {
        type: 'test',
      },
    } as unknown as Entity;
    const allowedKinds = [{ kind: 'Group', specType: 'test' }];
    expect(isAllowedKind(entity, allowedKinds)).toBeTruthy();
  });

  test('should return false if entity with specific type is not found', async () => {
    const entity = {
      kind: 'Group',
      spec: {
        type: 'test2',
      },
    } as unknown as Entity;
    const allowedKinds = [{ kind: 'Group', specType: 'test' }];
    expect(isAllowedKind(entity, allowedKinds)).toBeFalsy();
  });

  test('should return true if entity with specific type is allowed no matter the casing', async () => {
    const entity = {
      kind: 'Group',
      spec: {
        type: 'TEST',
      },
    } as unknown as Entity;
    const allowedKinds = [{ kind: 'Group', specType: 'test' }];
    expect(isAllowedKind(entity, allowedKinds)).toBeTruthy();
  });
});
