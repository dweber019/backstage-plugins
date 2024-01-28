import {
  ReadTreeOptions,
  ReadTreeResponse,
  ReadUrlOptions,
  ReadUrlResponse,
  SearchOptions,
  SearchResponse,
  UrlReader,
} from '@backstage/backend-common';
import * as fs from 'fs';

const data = fs.readFileSync('./dev/source-location-example.json', 'utf8');

export class MockUrlReader implements UrlReader {
  readTree(
    _url: string,
    _options?: ReadTreeOptions,
  ): Promise<ReadTreeResponse> {
    throw new Error('search not implemented.');
  }

  async readUrl(
    _url: string,
    _options?: ReadUrlOptions,
  ): Promise<ReadUrlResponse> {
    return {
      // @ts-ignore
      buffer: async () => Buffer.from(data),
    } as unknown as ReadUrlResponse;
  }

  search(_url: string, _options?: SearchOptions): Promise<SearchResponse> {
    throw new Error('search not implemented.');
  }
}
