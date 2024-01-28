import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { ApiEntity, Entity } from '@backstage/catalog-model';
import {
  apiDocsConfigRef,
  apiDocsPlugin,
  defaultDefinitionWidgets,
  EntityApiDefinitionCard,
} from '@backstage/plugin-api-docs';
import {
  apiDocsModuleWsdlDocPlugin,
  apiDocsModuleWsdlApiRef,
  ApiDocsModuleWsdlClient,
  wsdlApiWidget,
} from '../src';
import {
  BackstageUserIdentity,
  DiscoveryApi,
  IdentityApi,
  ProfileInfo,
} from '@backstage/core-plugin-api';
import { Content, Header, Page } from '@backstage/core-components';
// @ts-ignore
import helloWsdlApiEntity from './wsdl-api.yaml';
// @ts-ignore
import helloWsdlCalculatorApiEntity from './wsdl-calculator.yaml';
// @ts-ignore
import helloComplexWsdlApiEntity from './wsdl-complex-api.yaml';

const localDiscoveryApi: DiscoveryApi = {
  async getBaseUrl(pluginId: string): Promise<string> {
    return `http://localhost:7007/api/${pluginId}`;
  },
};

const localIdentityApi: IdentityApi = {
  async getCredentials(): Promise<{ token?: string }> {
    return {};
  },
  getProfileInfo(): Promise<ProfileInfo> {
    throw new Error('Function not implemented.');
  },
  getBackstageIdentity(): Promise<BackstageUserIdentity> {
    throw new Error('Function not implemented.');
  },
  signOut(): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

createDevApp()
  .registerPlugin(apiDocsPlugin)
  .registerApi({
    api: apiDocsConfigRef,
    deps: {},
    factory: () => {
      const definitionWidgets = defaultDefinitionWidgets();
      definitionWidgets.push(wsdlApiWidget);
      return {
        getApiDefinitionWidget: (apiEntity: ApiEntity) => {
          return definitionWidgets.find(d => d.type === apiEntity.spec.type);
        },
      };
    },
  })
  .registerPlugin(apiDocsModuleWsdlDocPlugin)
  .registerApi({
    api: apiDocsModuleWsdlApiRef,
    deps: {},
    factory: () =>
      new ApiDocsModuleWsdlClient({
        discoveryApi: localDiscoveryApi,
        identityApi: localIdentityApi,
      }),
  })
  .addPage({
    title: 'Simple',
    element: (
      <Page themeId="home">
        <Header title="WSDL" />
        <Content>
          <EntityProvider entity={helloWsdlApiEntity as any as Entity}>
            <EntityApiDefinitionCard />
          </EntityProvider>
        </Content>
      </Page>
    ),
  })
  .addPage({
    title: 'Calculator',
    element: (
      <Page themeId="home">
        <Header title="WSDL" />
        <Content>
          <EntityProvider
            entity={helloWsdlCalculatorApiEntity as any as Entity}
          >
            <EntityApiDefinitionCard />
          </EntityProvider>
        </Content>
      </Page>
    ),
  })
  .addPage({
    title: 'Complex',
    element: (
      <Page themeId="home">
        <Header title="WSDL" />
        <Content>
          <EntityProvider entity={helloComplexWsdlApiEntity as any as Entity}>
            <EntityApiDefinitionCard />
          </EntityProvider>
        </Content>
      </Page>
    ),
  })
  .render();
