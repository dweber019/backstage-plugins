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

import { Entity, EntityLink } from '@backstage/catalog-model';
import { extraTips } from './extraTips';
import { Tip } from '../config';

describe('Defaults tips', () => {
  const links: EntityLink[] = [{ url: 'link' }];
  const documentationAnnotation = { 'backstage.io/techdocs-ref': 'any' };

  const getTipActivateByTitle = (title: string) =>
    extraTips.find(tip => tip.title === title) as Tip;

  it('should activate on documentation missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
    } as Entity;

    const activate = getTipActivateByTitle('Documentation missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on documentation exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', annotations: documentationAnnotation },
      kind: 'Component',
    } as Entity;

    const activate = getTipActivateByTitle('Documentation missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on links missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
    } as Entity;

    const activate = getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeTruthy();
  });

  it('should activate on links missing with empty array', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links: [] },
      kind: 'Component',
    } as Entity;

    const activate = getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on links existing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock', links },
      kind: 'Component',
    } as Entity;

    const activate = getTipActivateByTitle('Links missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on system missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: {},
    } as Entity;

    const activate = getTipActivateByTitle('System missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on system exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { system: 'any' },
    } as Entity;

    const activate = getTipActivateByTitle('System missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on members missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Group',
      spec: {},
    } as Entity;

    const activate = getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
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

    const activate = getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
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

    const activate = getTipActivateByTitle('Members missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeFalsy();
  });

  it('should activate on domain missing', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'System',
      spec: {},
    } as Entity;

    const activate = getTipActivateByTitle('Domain missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeTruthy();
  });

  it('should not activate on domain exiting', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'System',
      spec: { domain: 'any' },
    } as Entity;

    const activate = getTipActivateByTitle('Domain missing').activate({
      entity: mockEntity,
    });

    expect(activate).toBeFalsy();
  });
});
