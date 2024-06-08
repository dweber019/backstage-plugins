import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { MockConfigApi } from '@backstage/test-utils';
import {
  apiDocsSpectralLinterPlugin,
  EntityApiDocsSpectralLinterContent,
} from '../src';
import { linterApiRef, LinterClient } from '../src/api';
// @ts-ignore
import asyncapiApiEntity from './asyncapi-example-api.yaml';
// @ts-ignore
import openapiApiEntity from './openapi-example-api.yaml';
// @ts-ignore
import openapiZalandoApiEntity from './openapi-zalando-example-api.yaml';
// @ts-ignore
import openapiBaloiseApiEntity from './openapi-baloise-example-api.yaml';
// @ts-ignore
import openapiOwaspApiEntity from './openapi-owasp-example-api.yaml';

// @ts-ignore
import openapiNonPrettyPrintedApiEntity from './openapi-non-pretty-printed-example-api.yaml';

const mockConfig = new MockConfigApi({
  spectralLinter: {
    openApiRulesetUrl:
      'https://gist.githubusercontent.com/dweber019/a368819668a76363849db6378792e907/raw/backstage-spectral-linter-openapi-ruleset.yaml',
    asyncApiRulesetUrl:
      'https://gist.githubusercontent.com/dweber019/a368819668a76363849db6378792e907/raw/backstage-spectral-linter-asyncapi-ruleset.yaml',
  },
});

createDevApp()
  .registerPlugin(apiDocsSpectralLinterPlugin)
  .registerApi({
    api: linterApiRef,
    deps: {},
    factory: () => new LinterClient({ configApi: mockConfig }),
  })
  .addPage({
    element: (
      <EntityProvider entity={openapiApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Open API',
    path: '/open-api',
  })
  .addPage({
    element: (
      <EntityProvider entity={asyncapiApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Async API',
    path: '/async-api',
  })
  .addPage({
    element: (
      <EntityProvider entity={openapiZalandoApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Open API - Zalando',
    path: '/open-api-zalando',
  })
  .addPage({
    element: (
      <EntityProvider entity={openapiBaloiseApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Open API - Baloise',
    path: '/open-api-baloise',
  })
  .addPage({
    element: (
      <EntityProvider entity={openapiOwaspApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Open API - OWASP',
    path: '/open-api-owasp',
  })
  .addPage({
    element: (
      <EntityProvider entity={openapiNonPrettyPrintedApiEntity as any as Entity}>
        <EntityApiDocsSpectralLinterContent />
      </EntityProvider>
    ),
    title: 'Open API - Non Pretty Printed',
    path: '/open-api-non-pretty-printed',
  })
  .render();
