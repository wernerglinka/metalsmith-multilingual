import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import Metalsmith from 'metalsmith';
import i18n from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Wraps Metalsmith.process in a Promise for use with node:test.
 *
 * @param {Metalsmith} ms - Metalsmith instance
 * @returns {Promise<Object>} Resolves with the files object
 */
function process(ms) {
  return new Promise((resolve, reject) => {
    ms.process((err, files) => {
      if (err) {
        return reject(err);
      }
      resolve(files);
    });
  });
}

describe('metalsmith-i18n (ESM)', () => {
  it('should export a function', () => {
    assert.strictEqual(typeof i18n, 'function');
  });

  it('should return a metalsmith plugin function', () => {
    const plugin = i18n();
    assert.strictEqual(typeof plugin, 'function');
    assert.strictEqual(plugin.length, 3);
  });

  describe('basic locale detection', () => {
    it('should set locale on each file', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'basic')).use(i18n())
      );
      assert.strictEqual(files['index.md'].locale, 'en');
      assert.strictEqual(files['works/2026.03.002.md'].locale, 'en');
      assert.strictEqual(files['de/index.md'].locale, 'de');
      assert.strictEqual(files['de/werke/2026.03.002.md'].locale, 'de');
    });

    it('should set isDefaultLocale correctly', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'basic')).use(i18n())
      );
      assert.strictEqual(files['index.md'].isDefaultLocale, true);
      assert.strictEqual(files['works/2026.03.002.md'].isDefaultLocale, true);
      assert.strictEqual(files['de/index.md'].isDefaultLocale, false);
      assert.strictEqual(files['de/werke/2026.03.002.md'].isDefaultLocale, false);
    });
  });

  describe('hreflang generation', () => {
    it('should build hreflang with self + alternate + x-default', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'basic')).use(i18n())
      );
      const hreflang = files['index.md'].hreflang;
      assert.strictEqual(hreflang.length, 3);
      assert.ok(hreflang.find((e) => e.lang === 'en' && e.url === '/'));
      assert.ok(hreflang.find((e) => e.lang === 'de' && e.url === '/de/'));
      assert.ok(hreflang.find((e) => e.lang === 'x-default' && e.url === '/'));
    });

    it('should build hreflang for German pages', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'basic')).use(i18n())
      );
      const hreflang = files['de/werke/2026.03.002.md'].hreflang;
      assert.strictEqual(hreflang.length, 3);
      assert.ok(hreflang.find((e) => e.lang === 'de' && e.url === '/de/werke/2026.03.002/'));
      assert.ok(hreflang.find((e) => e.lang === 'en' && e.url === '/works/2026.03.002/'));
      assert.ok(hreflang.find((e) => e.lang === 'x-default' && e.url === '/works/2026.03.002/'));
    });
  });

  describe('global metadata', () => {
    it('should set i18n metadata on metalsmith', async () => {
      const ms = Metalsmith(path.join(__dirname, 'fixtures', 'basic'));
      await process(ms.use(i18n()));
      const meta = ms.metadata();
      assert.ok(meta.i18n);
      assert.strictEqual(meta.i18n.defaultLocale, 'en');
      assert.strictEqual(meta.i18n.locales.length, 2);
      assert.ok(meta.i18n.locales.find((l) => l.code === 'en' && l.isDefault === true));
      assert.ok(meta.i18n.locales.find((l) => l.code === 'de' && l.isDefault === false));
      assert.strictEqual(meta.i18n.localeLabels.en, 'English');
      assert.strictEqual(meta.i18n.localeLabels.de, 'Deutsch');
    });
  });

  describe('no alternates', () => {
    it('should produce self-only hreflang when no alternate data exists', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'no-alternates')).use(i18n())
      );
      const hreflang = files['index.md'].hreflang;
      assert.strictEqual(hreflang.length, 1);
      assert.strictEqual(hreflang[0].lang, 'en');
      assert.strictEqual(hreflang[0].url, '/');
    });
  });

  describe('three locales', () => {
    it('should handle three-language setup', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'three-locales')).use(
          i18n({
            locales: ['en', 'de', 'fr'],
            localeLabels: { en: 'English', de: 'Deutsch', fr: 'Francais' }
          })
        )
      );
      const enHreflang = files['index.md'].hreflang;
      assert.strictEqual(enHreflang.length, 4);
      assert.ok(enHreflang.find((e) => e.lang === 'en'));
      assert.ok(enHreflang.find((e) => e.lang === 'de'));
      assert.ok(enHreflang.find((e) => e.lang === 'fr'));
      assert.ok(enHreflang.find((e) => e.lang === 'x-default'));

      assert.strictEqual(files['de/index.md'].locale, 'de');
      assert.strictEqual(files['fr/index.md'].locale, 'fr');
    });
  });

  describe('custom options', () => {
    it('should accept custom defaultLocale', async () => {
      const files = await process(
        Metalsmith(path.join(__dirname, 'fixtures', 'basic')).use(
          i18n({
            defaultLocale: 'de',
            locales: ['en', 'de']
          })
        )
      );
      assert.strictEqual(files['index.md'].locale, 'de');
      assert.strictEqual(files['index.md'].isDefaultLocale, true);
      assert.strictEqual(files['de/index.md'].locale, 'de');
      assert.strictEqual(files['de/index.md'].isDefaultLocale, true);
    });

    it('should accept custom localeLabels', async () => {
      const ms = Metalsmith(path.join(__dirname, 'fixtures', 'basic'));
      await process(
        ms.use(
          i18n({
            localeLabels: { en: 'EN', de: 'DE' }
          })
        )
      );
      assert.strictEqual(ms.metadata().i18n.localeLabels.en, 'EN');
      assert.strictEqual(ms.metadata().i18n.localeLabels.de, 'DE');
    });
  });

  describe('validation', () => {
    it('should throw for empty locales array', () => {
      assert.throws(() => {
        i18n({ locales: [] });
      }, /locales must be a non-empty array/);
    });

    it('should throw when defaultLocale is not in locales', () => {
      assert.throws(() => {
        i18n({ defaultLocale: 'fr', locales: ['en', 'de'] });
      }, /defaultLocale "fr" must be included in locales/);
    });

    it('should throw when pathPattern has no {locale} placeholder', () => {
      assert.throws(() => {
        i18n({ pathPattern: '**/*.md' });
      }, /pathPattern must contain the \{locale\} placeholder/);
    });
  });
});
