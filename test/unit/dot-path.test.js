import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getByDotPath } from '../../src/utils/dot-path.js';

describe('getByDotPath', () => {
  it('should read a top-level property', () => {
    const obj = { locale: 'en' };
    assert.strictEqual(getByDotPath(obj, 'locale'), 'en');
  });

  it('should read a nested property', () => {
    const obj = { seo: { alternate: { de: '/de/' } } };
    const result = getByDotPath(obj, 'seo.alternate');
    assert.deepStrictEqual(result, { de: '/de/' });
  });

  it('should read a deeply nested property', () => {
    const obj = { meta: { links: { alternate: { de: '/de/' } } } };
    const result = getByDotPath(obj, 'meta.links.alternate');
    assert.deepStrictEqual(result, { de: '/de/' });
  });

  it('should return undefined for missing intermediate key', () => {
    const obj = { seo: {} };
    assert.strictEqual(getByDotPath(obj, 'seo.alternate.de'), undefined);
  });

  it('should return undefined for null object', () => {
    assert.strictEqual(getByDotPath(null, 'seo.alternate'), undefined);
  });

  it('should return undefined for undefined object', () => {
    assert.strictEqual(getByDotPath(undefined, 'seo.alternate'), undefined);
  });

  it('should return undefined for empty path', () => {
    assert.strictEqual(getByDotPath({ a: 1 }, ''), undefined);
  });

  it('should return undefined for non-string path', () => {
    assert.strictEqual(getByDotPath({ a: 1 }, 42), undefined);
  });

  it('should return primitive values', () => {
    const obj = { seo: { title: 'Hello' } };
    assert.strictEqual(getByDotPath(obj, 'seo.title'), 'Hello');
  });
});
