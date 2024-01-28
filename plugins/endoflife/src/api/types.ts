import { createApiRef } from '@backstage/core-plugin-api';

/**
 * The products extracted from the annotation.
 *
 * @public
 */
export type AnnotationProducts = {
  product: string;
  cycle?: string;
}[];

/**
 * The result for all products.
 *
 * @public
 */
export type EndOfLifeProducts = String[];

/**
 * The result for one end of life cycle.
 *
 * @public
 */
export type EndOfLifeCycle = {
  product: string;
  cycle: string | number;
  releaseDate: string;
  lts: boolean | string | null;
  support: boolean | string | null;
  eol: boolean | string | null;
  extendedSupport: boolean | string | null;
  latest: string | null;
  latestReleaseDate: string | null;
  link: string | null;
  discontinued: boolean | null;
};

/**
 * The result for end of life product.
 *
 * @public
 */
export type EndOfLifeProduct = EndOfLifeCycle[];

/**
 * The API used by the end of life plugin.
 *
 * @public
 */
export interface EndOfLifeApi {
  /**
   * Get all product.
   *
   * @public
   */
  getProducts(): Promise<EndOfLifeProducts>;
  /**
   * Get end of life data for one product.
   *
   * @public
   */
  getProduct(product: string): Promise<EndOfLifeProduct>;
  /**
   * Get end of life cycle for one product.
   *
   * @public
   */
  getCycle(product: string, cycle: string): Promise<EndOfLifeCycle>;
  /**
   * Get end of life link for one product.
   *
   * @public
   */
  getProductLink(product: string): string;
  /**
   * Get end of life link.
   *
   * @public
   */
  getLink(): string;
  /**
   * Get end of life products by annotation.
   *
   * @public
   */
  getAnnotationProducts(
    annotationProducts: AnnotationProducts,
  ): Promise<EndOfLifeProduct>;
  /**
   * Get end of life data by URL location.
   *
   * @public
   */
  getFromURL(url: string): Promise<EndOfLifeProduct>;
  /**
   * Get end of life data by source location.
   *
   * @public
   */
  getFromSource(fileUrl: string): Promise<EndOfLifeProduct>;
}

/**
 * ApiRef for the EndOfLifeApi.
 *
 * @public
 */
export const endOfLifeApiRef = createApiRef<EndOfLifeApi>({
  id: 'plugin.endoflife.api',
});
