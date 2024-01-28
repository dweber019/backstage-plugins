import { endOfLifeApiRef, EndOfLifeProduct } from '../api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Entity, getEntitySourceLocation } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  extractEndOfLifeProductsAnnotation,
  extractEndOfLifeSourceLocationAnnotation,
  extractEndOfLifeUrlLocationAnnotation,
  extractProducts,
} from '../conditions';
import { useAsync } from 'react-use';
import { scmIntegrationsApiRef } from '@backstage/integration-react';

export type useEndOfLifeResult = {
  value?: EndOfLifeProduct;
  loading: boolean;
  error?: Error;
  title?: string;
  link?: string;
};

export function useEndOfLife(): useEndOfLifeResult {
  const { entity } = useEntity<Entity>();
  const endOfLifeApi = useApi(endOfLifeApiRef);
  const scmIntegrations = useApi(scmIntegrationsApiRef);

  const productsAnnotation = extractEndOfLifeProductsAnnotation(entity);
  const urlLocationAnnotation = extractEndOfLifeUrlLocationAnnotation(entity);
  const sourceLocationAnnotation =
    extractEndOfLifeSourceLocationAnnotation(entity);

  const { value, loading, error } = useAsync(async () => {
    if (productsAnnotation) {
      const products = extractProducts(productsAnnotation);
      return {
        result: await endOfLifeApi.getAnnotationProducts(products),
        title: products.map(item => item.product).join(', '),
        link:
          products.length > 1
            ? endOfLifeApi.getLink()
            : endOfLifeApi.getProductLink(products[0].product),
      };
    }
    if (urlLocationAnnotation) {
      const urlLocationResult = await endOfLifeApi.getFromURL(
        urlLocationAnnotation,
      );
      return {
        result: urlLocationResult,
        title: Array.from(
          new Set(urlLocationResult.map(item => item.product)),
        ).join(', '),
        link: urlLocationAnnotation,
      };
    }
    if (sourceLocationAnnotation) {
      const url = scmIntegrations.resolveUrl({
        url: sourceLocationAnnotation,
        base: getEntitySourceLocation(entity).target,
      });
      const sourceLocationResult = await endOfLifeApi.getFromSource(url);
      return {
        result: sourceLocationResult,
        title: Array.from(
          new Set(sourceLocationResult.map(item => item.product)),
        ).join(', '),
        link: url,
      };
    }
    return undefined;
  }, [productsAnnotation, urlLocationAnnotation, sourceLocationAnnotation]);

  return {
    value: value?.result,
    loading,
    error,
    title: value?.title,
    link: value?.link,
  };
}
