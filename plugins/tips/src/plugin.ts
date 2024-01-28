/*
 * Copyright 2022 The Backstage Authors
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
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { tipsConfigRef } from './config';
import { systemModelTips } from './lib/systemModelTips';
import { extraTips } from './lib/extraTips';

/** @public */
export const tipsPlugin = createPlugin({
  id: 'tips',
  apis: [
    createApiFactory({
      api: tipsConfigRef,
      deps: {},
      factory() {
        return {
          tips: [...systemModelTips, ...extraTips],
        };
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * An extension
 * @public
 */
export const EntityTipsDialog = tipsPlugin.provide(
  createRoutableExtension({
    name: 'EntityTipsDialog',
    component: () =>
      import('./components/EntityTipsDialog').then(m => m.EntityTipsDialog),
    mountPoint: rootRouteRef,
  }),
);
