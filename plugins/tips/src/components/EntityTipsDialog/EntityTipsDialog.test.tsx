import {
  ComponentEntity,
  EntityLink,
  SystemEntity,
} from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderWithEffects, TestApiProvider } from '@backstage/test-utils';
import { TipsConfig, tipsConfigRef } from '../../config';
import { EntityTipsDialog } from './EntityTipsDialog';
import { extraTips } from '../../lib/extraTips';
import { IdentityApi, identityApiRef } from '@backstage/core-plugin-api';

describe('EntityTipsDialog', () => {
  const mockTipsConfig: jest.Mocked<TipsConfig> = {
    tips: extraTips,
  };

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

  const links: EntityLink[] = [{ url: 'link' }];
  const documentationAnnotation = { 'backstage.io/techdocs-ref': 'any' };

  it('should have missing documentation', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links },
      kind: 'Component',
      spec: { system: 'any', owner: 'user:default/owner' },
    } as ComponentEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig], [identityApiRef, mockIdentityApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityTipsDialog />
        </EntityProvider>
      </TestApiProvider>,
    );

    const title = await rendered.findByTestId('tip-title');
    expect(title).toBeInTheDocument();
    expect(title.innerHTML).toBe('Documentation missing');

    const fabButton = await rendered.findByTestId('tip-fab');
    expect(fabButton).toBeInTheDocument();
    expect(fabButton.querySelector('.MuiBadge-badge')!.innerHTML).toBe('1');
  });

  it('should have missing domain', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', annotations: documentationAnnotation, links },
      kind: 'System',
      spec: { owner: 'user:default/owner' },
    } as SystemEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig], [identityApiRef, mockIdentityApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityTipsDialog />
        </EntityProvider>
      </TestApiProvider>,
    );

    const title = await rendered.findByTestId('tip-title');
    expect(title).toBeInTheDocument();
    expect(title.innerHTML).toBe('Domain missing');

    const fabButton = await rendered.findByTestId('tip-fab');
    expect(fabButton).toBeInTheDocument();
    expect(fabButton.querySelector('.MuiBadge-badge')!.innerHTML).toBe('1');
  });

  it('should not render fab button', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links, annotations: documentationAnnotation },
      kind: 'Component',
      spec: { system: 'any', type: 'any', owner: 'user:default/owner', lifecycle: 'any' },
    } as ComponentEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig], [identityApiRef, mockIdentityApi]]}>
        <EntityProvider entity={mockEntity}>
          <EntityTipsDialog />
        </EntityProvider>
      </TestApiProvider>,
    );

    const fabButton = rendered.queryByTestId('tip-fab');
    expect(fabButton).not.toBeInTheDocument();
  });
});
