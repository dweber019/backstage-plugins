import { configApiRef } from '@backstage/core-plugin-api';
import { renderHook } from '@testing-library/react';
import { ConfigReader } from '@backstage/config';
import { useRelations } from './useRelations';
import { TestApiProvider } from '@backstage/test-utils';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';

describe('useRelationsCatalogGraphDefaults', () => {
  const config = new ConfigReader({
    relationsProcessor: {
      relations: [
        {
          sourceKind: 'Component',
          attribute: 'test',
          pairs: [
            {
              incoming: 'testOf',
              outgoing: 'testBy',
            },
          ],
        },
        {
          sourceKind: 'Component',
          attribute: 'other',
          pairs: [
            {
              incoming: 'otherOf',
              outgoing: 'otherBy',
            },
          ],
        },
        {
          sourceKind: 'Component',
          attribute: 'owner',
          pairs: [
            {
              incoming: 'ownerOf',
              outgoing: 'ownedBy',
            },
          ],
        },
      ],
    },
  });
  const entity = {
    kind: 'Component',
    metadata: {
      name: 'component-1',
      namespace: 'default',
    },
    relations: [
      {
        type: 'testOf',
        targetRef: 'test:default/test-1',
      },
      {
        type: 'otherOf',
        targetRef: 'other:default/other-1',
      },
      {
        type: 'ownerOf',
        targetRef: 'user:default/user-1',
      },
    ],
  } as unknown as Entity;

  const AllTheProviders = ({ children }: any) => {
    return (
      <TestApiProvider apis={[[configApiRef, config]]}>
        <EntityProvider entity={entity}>{children}</EntityProvider>
      </TestApiProvider>
    );
  };

  test('should return relations with relation name as label', () => {
    const { result } = renderHook(() => useRelations(), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toMatchSnapshot();
  });

  test('should return relations with custom label', () => {
    const relationLabels = [
      {
        name: 'testOf',
        label: 'Custom label',
      },
    ];
    const { result } = renderHook(() => useRelations(relationLabels), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toMatchSnapshot();
  });

  test('should return relations whitelisted', () => {
    const relationWhitelist = [
      {
        name: 'otherOf',
      },
    ];
    const { result } = renderHook(() => useRelations(relationWhitelist), {
      wrapper: AllTheProviders,
    });

    expect(result.current).toMatchSnapshot();
  });
});
