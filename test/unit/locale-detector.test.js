import assert from 'node:assert';
import { describe, it } from 'node:test';
import { compilePathPattern, detectLocale } from '../../src/utils/locale-detector.js';

describe('compilePathPattern', () => {
  it('should produce a regex that matches locale prefixes', () => {
    const pattern = compilePathPattern('{locale}/**', ['en', 'de']);
    assert.ok(pattern instanceof RegExp);
    assert.ok(pattern.test('de/index.md'));
    assert.ok(!pattern.test('index.md'));
  });

  it('should handle three locales', () => {
    const pattern = compilePathPattern('{locale}/**', ['en', 'de', 'fr']);
    assert.ok(pattern.test('fr/index.md'));
    assert.ok(pattern.test('de/werke/foo.md'));
    assert.ok(pattern.test('en/about.md'));
  });
});

describe('detectLocale', () => {
  const pattern = compilePathPattern('{locale}/**', ['en', 'de']);

  it('should detect "de" from de/index.md', () => {
    assert.strictEqual(detectLocale('de/index.md', pattern, 'en'), 'de');
  });

  it('should detect "de" from nested path de/werke/foo.md', () => {
    assert.strictEqual(detectLocale('de/werke/foo.md', pattern, 'en'), 'de');
  });

  it('should return default locale for root-level files', () => {
    assert.strictEqual(detectLocale('index.md', pattern, 'en'), 'en');
  });

  it('should return default locale for non-locale subdirectories', () => {
    assert.strictEqual(detectLocale('works/foo.md', pattern, 'en'), 'en');
  });

  it('should return default locale for unknown locale prefix', () => {
    assert.strictEqual(detectLocale('fr/index.md', pattern, 'en'), 'en');
  });

  it('should handle Windows backslash paths', () => {
    assert.strictEqual(detectLocale('de\\index.md', pattern, 'en'), 'de');
  });

  it('should handle deeply nested locale paths', () => {
    assert.strictEqual(detectLocale('de/werke/2026/details/foo.md', pattern, 'en'), 'de');
  });
});
