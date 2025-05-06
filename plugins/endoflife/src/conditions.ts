import { Entity } from '@backstage/catalog-model';
import {
  END_OF_LIFE_PRODUCTS_ANNOTATION,
  END_OF_LIFE_SOURCE_LOCATION_ANNOTATION,
  END_OF_LIFE_URL_LOCATION_ANNOTATION,
} from './constants';
import { AnnotationProducts } from './api';

/**
 * @public
 */
export function isEndOfLifeAvailable(entity: Entity): boolean {
  return (
    Boolean(extractEndOfLifeProductsAnnotation(entity)) ||
    Boolean(extractEndOfLifeUrlLocationAnnotation(entity)) ||
    Boolean(extractEndOfLifeSourceLocationAnnotation(entity))
  );
}

/**
 * @public
 */
export function extractEndOfLifeProductsAnnotation(
  entity: Entity,
): string | undefined {
  return entity.metadata.annotations?.[END_OF_LIFE_PRODUCTS_ANNOTATION];
}

/**
 * @public
 */
export function extractEndOfLifeUrlLocationAnnotation(
  entity: Entity,
): string | undefined {
  return entity.metadata.annotations?.[END_OF_LIFE_URL_LOCATION_ANNOTATION];
}

/**
 * @public
 */
export function extractEndOfLifeSourceLocationAnnotation(
  entity: Entity,
): string | undefined {
  return entity.metadata.annotations?.[END_OF_LIFE_SOURCE_LOCATION_ANNOTATION];
}

/**
 * @public
 */
export function extractProducts(annotation: string): AnnotationProducts {
  return annotation.split(',').map((s) => s.trim()).map(product => {
    const productWithCycle = product.split('@');
    return {
      product: productWithCycle[0],
      cycle: productWithCycle.length > 1 ? productWithCycle[1] : undefined,
    };
  });
}
