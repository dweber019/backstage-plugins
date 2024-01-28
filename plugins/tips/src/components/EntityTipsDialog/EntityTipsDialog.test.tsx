/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ComponentEntity,
  EntityLink,
  SystemEntity,
} from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderWithEffects, TestApiProvider } from '@backstage/test-utils';
import React from 'react';
import { TipsConfig, tipsConfigRef } from '../../config';
import { EntityTipsDialog } from './EntityTipsDialog';
import { extraTips } from '../../lib/extraTips';

describe('EntityTipsDialog', () => {
  const mockTipsConfig: jest.Mocked<TipsConfig> = {
    tips: extraTips,
  };

  const links: EntityLink[] = [{ url: 'link' }];
  const documentationAnnotation = { 'backstage.io/techdocs-ref': 'any' };

  it('should have missing documentation', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links },
      kind: 'Component',
      spec: { system: 'any' },
    } as ComponentEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig]]}>
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
      spec: { owner: 'any' },
    } as SystemEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig]]}>
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
      spec: { system: 'any', type: 'any', owner: 'any', lifecycle: 'any' },
    } as ComponentEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider apis={[[tipsConfigRef, mockTipsConfig]]}>
        <EntityProvider entity={mockEntity}>
          <EntityTipsDialog />
        </EntityProvider>
      </TestApiProvider>,
    );

    const fabButton = rendered.queryByTestId('tip-fab');
    expect(fabButton).not.toBeInTheDocument();
  });
});
