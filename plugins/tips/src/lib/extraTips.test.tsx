import { Entity, EntityLink } from '@backstage/catalog-model';
import { extraTips } from './extraTips';
import { Tip } from '../config';
import { IdentityApi } from '@backstage/core-plugin-api';

describe('Defaults tips', () => {
  const links: EntityLink[] = [{ url: 'link' }];
  const documentationAnnotation = { 'backstage.io/techdocs-ref': 'any' };

  const mockIdentityApi: jest.Mocked<IdentityApi> = {
    getBackstageIdentity: jest.fn().mockResolvedValue({
      type: 'user',
      userEntityRef: 'user:default/owner',
      ownershipEntityRefs: ['user:default/owner'],
    }),
    signOut: jest.fn(),
    getCredentials: jest.fn(),
    getProfileInfo: jest.fn(),
  };

  const getTipActivateByTitle = (title: string) =>
    extraTips.find(tip => tip.title === title) as Tip;

  it('should activate on documentation missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('Documentation missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on documentation existing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', annotations: documentationAnnotation },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('Documentation missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on links missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should activate on links missing with empty array', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links: [] },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on links existing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on system missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { owner: 'user:default/owner' }
    } as Entity;

    const activate = await getTipActivateByTitle('System missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on system exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { system: 'any', owner: 'user:default/owner' },
    } as Entity;

    const activate = await getTipActivateByTitle('System missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on members missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Group',
      spec: {}
    } as Entity;

    const activate = await getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should activate on members missing with empty array', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Group',
      spec: { members: [] },
    } as Entity;

    const activate = await getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on members exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Group',
      spec: { members: ['user1'] },
    } as Entity;

    const activate = await getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on domain missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'System',
      spec: { owner: 'user:default/owner' },
    } as Entity;

    const activate = await getTipActivateByTitle('Domain missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on domain exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'System',
      spec: { domain: 'any', owner: 'user:default/owner' },
    } as Entity;

    const activate = await getTipActivateByTitle('Domain missing').activate({
      entity: mockEntity,
      identity: mockIdentityApi,
    });

    expect(activate).toBeFalsy();
  });
});
