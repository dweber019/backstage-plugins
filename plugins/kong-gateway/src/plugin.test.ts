import { missingEntityPlugin } from './plugin';

describe('missing entity', () => {
  it('should export plugin', () => {
    expect(missingEntityPlugin).toBeDefined();
  });
});
