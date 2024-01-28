import { AnnotationProducts, EndOfLifeClient, EndOfLifeProduct } from '../src';
import { DateTime } from 'luxon';

export class TestEndOfLifeClient extends EndOfLifeClient {
  async getAnnotationProducts(
    annotationProducts: AnnotationProducts,
  ): Promise<EndOfLifeProduct> {
    if (!annotationProducts.some(value => value.product === 'use-cases')) {
      return super.getAnnotationProducts(annotationProducts);
    }
    return [
      {
        cycle: 'release only',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'release + discontinued',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        discontinued: true,
        product: 'Case: ',
      },
      {
        cycle: 'release + discontinued + latestDate',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        discontinued: true,
        latestReleaseDate: DateTime.now().minus({ month: 3 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'release + discontinued + latestDate future',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        discontinued: true,
        latestReleaseDate: DateTime.now().plus({ month: 3 }).toISODate(),
        product: 'Case: ',
      },
      // support
      {
        cycle: 'support ok',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        support: DateTime.now().plus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'support close',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        support: DateTime.now().plus({ month: 2 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'support nok',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        support: DateTime.now().minus({ month: 1 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'support true',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        support: true,
        product: 'Case: ',
      },
      // EOL
      {
        cycle: 'eol ok - support',
        support: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().plus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol ok - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().plus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol close - support',
        support: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().plus({ month: 2 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol close - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().plus({ month: 2 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol nok - support',
        support: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().minus({ month: 1 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol nok - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: DateTime.now().minus({ month: 1 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'eol true - support',
        support: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: true,
        product: 'Case: ',
      },
      {
        cycle: 'eol true - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        eol: true,
        product: 'Case: ',
      },
      // ExtendedSupport
      {
        cycle: 'extendedSupport ok - eol',
        eol: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().plus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport ok - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().plus({ month: 6 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport close - eol',
        eol: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().plus({ month: 2 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport close - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().plus({ month: 2 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport nok - eol',
        eol: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().minus({ month: 1 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport nok - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: DateTime.now().minus({ month: 1 }).toISODate(),
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport true - eol',
        eol: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: true,
        product: 'Case: ',
      },
      {
        cycle: 'extendedSupport true - release',
        releaseDate: DateTime.now().minus({ month: 6 }).toISODate(),
        extendedSupport: true,
        product: 'Case: ',
      },
    ] as unknown as EndOfLifeProduct;
  }
}
