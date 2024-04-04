import { ComponentEntity, SystemEntity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderWithEffects, TestApiProvider } from '@backstage/test-utils';
import React from 'react';
import { EntityEndOfLifeCard } from './EntityEndOfLifeCard';
import { EndOfLifeApi, endOfLifeApiRef } from '../../api';
import {
  AppThemeApi,
  appThemeApiRef,
  ConfigApi,
  configApiRef,
} from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import { ScmIntegrationRegistry } from '@backstage/integration';

describe('EntityEndOfLifeCard', () => {
  const mockEndOfLifeApi: jest.Mocked<EndOfLifeApi> = {
    getAnnotationProducts: jest.fn().mockResolvedValue([
      {
        cycle: '7',
        releaseDate: '2013-12-11',
        support: '2019-08-06',
        eol: '2024-06-30',
        lts: '2024-06-30',
        extendedSupport: '2028-06-30',
        latest: '7.9',
        latestReleaseDate: '2020-09-29',
        product: 'rhel',
      },
    ]),
    getCycle: jest.fn(),
    getLink: jest.fn().mockReturnValue('https://endoflife.date/'),
    getProduct: jest.fn(),
    getProductLink: jest.fn().mockReturnValue('https://endoflife.date/rhel'),
    getProducts: jest.fn(),
    getFromURL: jest.fn(),
    getFromSource: jest.fn(),
  };
  const mockAppThemeApi = {
    getActiveThemeId: jest.fn(),
  } as unknown as AppThemeApi;
  const mockScmIntegrationRegistry = {
    resolveUrl: jest.fn(),
  } as unknown as ScmIntegrationRegistry;
  const mockConfigApi = {
    getOptionalString: jest.fn(),
  } as unknown as ConfigApi;

  const endOfLifeAnnotation = { 'endoflife.date/products': 'rhel' };

  it('should have missing annotation', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: { name: 'mock' },
      kind: 'Component',
      spec: { system: 'any' },
    } as ComponentEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider
        apis={[
          [endOfLifeApiRef, mockEndOfLifeApi],
          [appThemeApiRef, mockAppThemeApi],
          [scmIntegrationsApiRef, mockScmIntegrationRegistry],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityEndOfLifeCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    const annotation = await rendered.findByText('endoflife.date/products');
    expect(annotation).toBeInTheDocument();
  });

  it('should have rendered', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'mock',
        annotations: { ...(endOfLifeAnnotation as any) },
      },
      kind: 'System',
      spec: { owner: 'any' },
    } as SystemEntity;

    const rendered = await renderWithEffects(
      <TestApiProvider
        apis={[
          [endOfLifeApiRef, mockEndOfLifeApi],
          [appThemeApiRef, mockAppThemeApi],
          [scmIntegrationsApiRef, mockScmIntegrationRegistry],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityEndOfLifeCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    const cardTitle = await rendered.findByText('End of life for rhel');
    expect(cardTitle).toBeInTheDocument();

    const groupRhel8 = await rendered.findByText('rhel 7 (LTS)');
    expect(groupRhel8).toBeInTheDocument();

    const cardDeepLink = await rendered.findByText('View more for rhel');
    expect(cardDeepLink).toBeInTheDocument();
  });

  it('should have rendered with overlapping cycles', async () => {
    const mockEntity = {
      apiVersion: 'backstage.io/v1beta1',
      metadata: {
        name: 'mock',
        annotations: { 'endoflife.date/products': 'oracle-jdk,redhat-jboss-eap@7' },
      },
      kind: 'System',
      spec: { owner: 'any' },
    } as SystemEntity;

    const mockEndOfLifeApiOverlappingCycles = {
      ...mockEndOfLifeApi,
      getAnnotationProducts: jest.fn().mockResolvedValue([
        {
          cycle: "7",
          lts: true,
          releaseDate: "2011-07-11",
          eol: "2019-07-31",
          link: "https://www.oracle.com/java/technologies/javase/7-support-relnotes.html#R170_361",
          latest: "7u351",
          latestReleaseDate: "2022-07-19",
          extendedSupport: "2022-07-19",
          product: 'oracle-jdk',
        },
        {
          cycle: "7",
          releaseDate: "2016-05-01",
          eol: "2025-06-30",
          latest: "7.4.14",
          latestReleaseDate: "2023-12-12",
          lts: false,
          support: "2023-12-31",
          extendedSupport: "2026-11-30",
          product: 'redhat-jboss-eap',
        },
      ])
    }

    const rendered = await renderWithEffects(
      <TestApiProvider
        apis={[
          [endOfLifeApiRef, mockEndOfLifeApiOverlappingCycles],
          [appThemeApiRef, mockAppThemeApi],
          [scmIntegrationsApiRef, mockScmIntegrationRegistry],
          [configApiRef, mockConfigApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityEndOfLifeCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    const cardTitle = await rendered.findByText('End of life for oracle-jdk, redhat-jboss-eap');
    expect(cardTitle).toBeInTheDocument();

    const groupRhel8 = await rendered.findByText('oracle-jdk 7 (LTS)');
    expect(groupRhel8).toBeInTheDocument();

    const cardDeepLink = await rendered.findByText('View more for oracle-jdk, redhat-jboss-eap');
    expect(cardDeepLink).toBeInTheDocument();
  });
});
