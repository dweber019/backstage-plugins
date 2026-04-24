/*
 * Copyright 2024 The Backstage Authors
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
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { linterApiRef, LinterClient } from './api';
import { isApiDocsSpectralLinterAvailable } from './lib/helper';

/**
 * Provides the Spectral Linter API as an extension.
 * @alpha
 */
const spectralLinterApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: linterApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => new LinterClient({ configApi }),
    }),
});

/**
 * Entity content extension that renders the Spectral Linter tab on API entity pages.
 * @alpha
 */
const spectralLinterContent = EntityContentBlueprint.make({
  name: 'spectral-linter',
  params: {
    path: '/spectral-linter',
    title: 'Spectral Linter',
    filter: entity => isApiDocsSpectralLinterAvailable(entity),
    loader: () =>
      import('./components/EntityApiDocsSpectralLinterContent').then(m => (
        <m.EntityApiDocsSpectralLinterContent />
      )),
  },
});

/**
 * The API docs spectral linter plugin, for use with the new frontend system.
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'api-docs-spectral-linter',
  extensions: [spectralLinterApi, spectralLinterContent],
});
