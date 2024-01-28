import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { tipsPlugin, EntityTipsDialog } from '../src';
// @ts-ignore
import componentEntity from './example-component.yaml';
// @ts-ignore
import groupEntity from './example-group.yaml';
// @ts-ignore
import systemEntity from './example-system.yaml';
import { PageWithHeader } from '@backstage/core-components';

createDevApp()
  .registerPlugin(tipsPlugin)
  .addPage({
    element: (
      <EntityProvider entity={componentEntity as any as Entity}>
        <PageWithHeader title="Test" themeId="tool">
          <EntityTipsDialog />
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'Tips',
    path: '/tips',
  })
  .addPage({
    element: (
      <EntityProvider entity={groupEntity as any as Entity}>
        <PageWithHeader title="Test" themeId="tool">
          <EntityTipsDialog />
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'Tips - Group',
    path: '/tips-group',
  })
  .addPage({
    element: (
      <EntityProvider entity={systemEntity as any as Entity}>
        <PageWithHeader title="Test" themeId="tool">
          <EntityTipsDialog />
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'Tips - System',
    path: '/tips-system',
  })
  .render();
