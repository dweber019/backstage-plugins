import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityTasksCard, tasksPlugin } from '../src';

createDevApp()
  .registerPlugin(tasksPlugin)
  .addPage({
    element: <EntityTasksCard />,
    title: 'Root Page',
    path: '/tasks',
  })
  .render();
