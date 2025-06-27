import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { endOfLifeApiRef, endOfLifePlugin, EntityEndOfLifeCard } from '../src';
import { Content, PageWithHeader } from '@backstage/core-components';
import { TestEndOfLifeClient } from './TestEndOfLifeClient';
import {
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

const entityTemplate = (productsAnnotation: string): Entity => {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'example',
      annotations: {
        'endoflife.date/products': productsAnnotation,
      },
    },
    spec: {},
  };
};

const entityUrlTemplate = (url: string): Entity => {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'example',
      annotations: {
        'endoflife.date/url-location': url,
      },
    },
    spec: {},
  };
};

const entitySourceTemplate = (source: string): Entity => {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: 'example',
      annotations: {
        'endoflife.date/source-location': source,
        'backstage.io/source-location':
          'url:https://github.com/dweber019/backstage-plugin-endoflife/tree/master/',
      },
    },
    spec: {},
  };
};

const annotationsUnderTest = [
  'angular',
  'rhel',
  'postgresql,prometheus',
  'rabbitmq@3.12',
  'mssqlserver@2022,mysql@8.2',
  'python',
  'ruby',
  'redhat-build-of-openjdk',
  'nokia',
  'unity',
  'haproxy',
  'azure-kubernetes-service',
  'coldfusion',
  'kindle',
  'ios',
  'iphone',
  'bootstrap',
  'filemaker',
  'internet-explorer',
  'kong-gateway',
  'oracle-jdk',
  'oracle-database',
  'red-hat-openshift',
  'spring-framework',
  'ubuntu',
];

const builder = createDevApp()
  .registerPlugin(endOfLifePlugin)
  .registerApi({
    api: endOfLifeApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
      identityApi: identityApiRef,
    },
    factory: ({ discoveryApi, fetchApi, identityApi }) =>
      new TestEndOfLifeClient({
        baseUrl: 'https://endoflife.date',
        discoveryApi,
        fetchApi,
        identityApi,
      }),
  })
  .addPage({
    element: (
      <EntityProvider
        entity={entityUrlTemplate(
          'https://raw.githubusercontent.com/dweber019/backstage-plugins/main/plugins/endoflife/dev/url-location-example.json',
        )}
      >
        <PageWithHeader title="Test" themeId="tool">
          <Content>
            <EntityEndOfLifeCard />
          </Content>
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'url-location',
    path: '/url-location',
  })
  .addPage({
    element: (
      <EntityProvider entity={entitySourceTemplate('./versions.json')}>
        <PageWithHeader title="Test" themeId="tool">
          <Content>
            <EntityEndOfLifeCard />
          </Content>
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'source-location',
    path: '/source-location',
  })
  .addPage({
    element: (
      <EntityProvider entity={entityTemplate('use-cases')}>
        <PageWithHeader title="Test" themeId="tool">
          <Content>
            <EntityEndOfLifeCard />
          </Content>
        </PageWithHeader>
      </EntityProvider>
    ),
    title: 'use-cases',
    path: `/use-cases`,
  });

for (const annotation of annotationsUnderTest) {
  builder.addPage({
    element: (
      <EntityProvider entity={entityTemplate(annotation)}>
        <PageWithHeader title="Test" themeId="tool">
          <Content>
            <EntityEndOfLifeCard />
          </Content>
        </PageWithHeader>
      </EntityProvider>
    ),
    title: annotation,
    path: `/${annotation}`,
  });
}

builder.render();
