import assert from 'node:assert';
import { describe, it } from 'node:test';
import { buildHreflang, filepathToUrl } from '../../src/utils/hreflang-builder.js';

describe('filepathToUrl', () => {
  it('should convert index.md to /', () => {
    assert.strictEqual(filepathToUrl('index.md'), '/');
  });

  it('should convert de/index.md to /de/', () => {
    assert.strictEqual(filepathToUrl('de/index.md'), '/de/');
  });

  it('should convert works/2026.03.002.md to /works/2026.03.002/', () => {
    assert.strictEqual(filepathToUrl('works/2026.03.002.md'), '/works/2026.03.002/');
  });

  it('should convert de/werke/2026.03.002.md to /de/werke/2026.03.002/', () => {
    assert.strictEqual(filepathToUrl('de/werke/2026.03.002.md'), '/de/werke/2026.03.002/');
  });

  it('should convert about.html to /about/', () => {
    assert.strictEqual(filepathToUrl('about.html'), '/about/');
  });

  it('should handle nested index files', () => {
    assert.strictEqual(filepathToUrl('about/index.md'), '/about/');
  });

  it('should handle Windows backslash paths', () => {
    assert.strictEqual(filepathToUrl('de\\werke\\foo.md'), '/de/werke/foo/');
  });
});

describe('buildHreflang', () => {
  it('should build self + alternate + x-default entries', () => {
    const result = buildHreflang({ de: '/de/' }, 'en', '/', 'en');
    assert.deepStrictEqual(result, [
      { lang: 'en', url: '/' },
      { lang: 'de', url: '/de/' },
      { lang: 'x-default', url: '/' },
    ]);
  });

  it('should set x-default to the default locale URL', () => {
    const result = buildHreflang({ en: '/' }, 'de', '/de/', 'en');
    assert.deepStrictEqual(result, [
      { lang: 'de', url: '/de/' },
      { lang: 'en', url: '/' },
      { lang: 'x-default', url: '/' },
    ]);
  });

  it('should return self-only when alternateData is undefined', () => {
    const result = buildHreflang(undefined, 'en', '/', 'en');
    assert.deepStrictEqual(result, [{ lang: 'en', url: '/' }]);
  });

  it('should return self-only when alternateData is null', () => {
    const result = buildHreflang(null, 'en', '/', 'en');
    assert.deepStrictEqual(result, [{ lang: 'en', url: '/' }]);
  });

  it('should return self-only when alternateData is empty', () => {
    const result = buildHreflang({}, 'en', '/', 'en');
    assert.deepStrictEqual(result, [{ lang: 'en', url: '/' }]);
  });

  it('should return self-only when alternateData is not an object', () => {
    const result = buildHreflang('not-an-object', 'en', '/', 'en');
    assert.deepStrictEqual(result, [{ lang: 'en', url: '/' }]);
  });

  it('should handle multiple alternates', () => {
    const result = buildHreflang({ de: '/de/', fr: '/fr/' }, 'en', '/', 'en');
    assert.strictEqual(result.length, 4);
    assert.ok(result.find((e) => e.lang === 'en'));
    assert.ok(result.find((e) => e.lang === 'de'));
    assert.ok(result.find((e) => e.lang === 'fr'));
    assert.ok(result.find((e) => e.lang === 'x-default'));
  });
});
