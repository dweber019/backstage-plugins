import {
  UrlReaderService, UrlReaderServiceReadTreeResponse,
  UrlReaderServiceReadUrlOptions,
  UrlReaderServiceReadUrlResponse, UrlReaderServiceSearchOptions, UrlReaderServiceSearchResponse,
} from '@backstage/backend-plugin-api';
import * as fs from 'fs';

const data = fs.readFileSync('./dev/source-location-example.json', 'utf8');

export class MockUrlReader implements UrlReaderService {
  readTree(
    _url: string,
    _options?: UrlReaderServiceReadUrlOptions,
  ): Promise<UrlReaderServiceReadTreeResponse> {
    throw new Error('search not implemented.');
  }

  async readUrl(
    _url: string,
    _options?: UrlReaderServiceReadUrlOptions,
  ): Promise<UrlReaderServiceReadUrlResponse> {
    return {
      // @ts-ignore
      buffer: async () => Buffer.from(data),
    } as unknown as UrlReaderServiceReadUrlResponse;
  }

  search(_url: string, _options?: UrlReaderServiceSearchOptions): Promise<UrlReaderServiceSearchResponse> {
    throw new Error('search not implemented.');
  }
}
