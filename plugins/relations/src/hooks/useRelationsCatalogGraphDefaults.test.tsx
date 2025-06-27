import { configApiRef } from '@backstage/core-plugin-api';
import { renderHook } from '@testing-library/react';
import { ConfigReader } from '@backstage/config';
import { useRelationsCatalogGraphDefaults } from './useRelationsCatalogGraphDefaults';
import { TestApiProvider } from '@backstage/test-utils';

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

  const AllTheProviders = ({ children }: any) => {
    return (
      <TestApiProvider apis={[[configApiRef, config]]}>
        {children}
      </TestApiProvider>
    );
  };

  test('should return arrow=true as default', () => {
    const { result } = renderHook(() => useRelationsCatalogGraphDefaults({}), {
      wrapper: AllTheProviders,
    });

    expect(result.current.showArrowHeads).toBeTruthy();
  });

  test('should return arrow overwrite', () => {
    const { result } = renderHook(
      () => useRelationsCatalogGraphDefaults({ showArrowHeads: false }),
      { wrapper: AllTheProviders },
    );

    expect(result.current.showArrowHeads).toBeFalsy();
  });

  test('should return unidirectional=false as default', () => {
    const { result } = renderHook(() => useRelationsCatalogGraphDefaults({}), {
      wrapper: AllTheProviders,
    });

    expect(result.current.unidirectional).toBeFalsy();
  });

  test('should return unidirectional overwrite', () => {
    const { result } = renderHook(
      () => useRelationsCatalogGraphDefaults({ unidirectional: true }),
      { wrapper: AllTheProviders },
    );

    expect(result.current.unidirectional).toBeTruthy();
  });

  test('should return relationPairs defaults', () => {
    const { result } = renderHook(() => useRelationsCatalogGraphDefaults({}), {
      wrapper: AllTheProviders,
    });

    expect(result.current.relationPairs).toMatchSnapshot();
  });

  test('should return relationPairs overwrite', () => {
    const { result } = renderHook(
      () =>
        useRelationsCatalogGraphDefaults({
          relationPairs: [['overwriteOf', 'overwriteBy']],
        }),
      { wrapper: AllTheProviders },
    );

    expect(result.current.relationPairs).toMatchSnapshot();
  });
});
