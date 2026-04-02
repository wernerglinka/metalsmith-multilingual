import { getByDotPath } from './utils/dot-path.js';
import { buildHreflang, filepathToUrl } from './utils/hreflang-builder.js';
import { compilePathPattern, detectLocale } from './utils/locale-detector.js';

/**
 * @typedef {Object} I18nOptions
 * @property {string} [defaultLocale='en'] - Fallback locale code
 * @property {string[]} [locales=['en', 'de']] - Supported locale codes
 * @property {string} [pathPattern='{locale}/**'] - Pattern for detecting locale from file path
 * @property {string} [alternateKey='seo.alternate'] - Dot-path to alternate links in frontmatter
 * @property {Object<string, string>} [localeLabels] - Map of locale codes to human-readable labels
 */

/** @type {I18nOptions} */
const DEFAULTS = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  pathPattern: '{locale}/**',
  alternateKey: 'seo.alternate',
  localeLabels: { en: 'English', de: 'Deutsch' },
};

/**
 * Validates plugin configuration and throws on invalid options.
 *
 * @param {I18nOptions} config - Merged plugin configuration
 */
function validateConfig(config) {
  if (!Array.isArray(config.locales) || config.locales.length === 0) {
    throw new Error('locales must be a non-empty array');
  }

  if (!config.locales.includes(config.defaultLocale)) {
    throw new Error(
      `defaultLocale "${config.defaultLocale}" must be included in locales [${config.locales.join(', ')}]`
    );
  }

  if (!config.pathPattern.includes('{locale}')) {
    throw new Error('pathPattern must contain the {locale} placeholder');
  }
}

/**
 * A Metalsmith plugin that adds internationalization metadata to files.
 *
 * Detects each file's locale from its path, builds hreflang cross-references
 * from frontmatter alternate links, and exposes global i18n configuration
 * via metalsmith.metadata().
 *
 * @param {I18nOptions} [options={}] - Plugin configuration
 * @returns {import('metalsmith').Plugin} Metalsmith plugin function
 */
function i18n(options = {}) {
  const config = { ...DEFAULTS, ...options };

  validateConfig(config);

  const localePattern = compilePathPattern(config.pathPattern, config.locales);

  const metalsmithPlugin = (files, metalsmith, done) => {
    const debug = metalsmith.debug('metalsmith-i18n');

    try {
      debug('Starting with config: %O', {
        defaultLocale: config.defaultLocale,
        locales: config.locales,
        pathPattern: config.pathPattern,
        alternateKey: config.alternateKey,
      });

      const metadata = metalsmith.metadata();
      metadata.i18n = {
        defaultLocale: config.defaultLocale,
        locales: config.locales.map((code) => ({
          code,
          label: config.localeLabels[code] || code,
          isDefault: code === config.defaultLocale,
        })),
        localeLabels: { ...config.localeLabels },
      };

      const filePaths = Object.keys(files);

      for (const filepath of filePaths) {
        const file = files[filepath];
        const locale = detectLocale(filepath, localePattern, config.defaultLocale);

        file.locale = locale;
        file.isDefaultLocale = locale === config.defaultLocale;

        const alternateData = getByDotPath(file, config.alternateKey);
        const selfUrl = filepathToUrl(filepath);
        file.hreflang = buildHreflang(alternateData, locale, selfUrl, config.defaultLocale);

        debug('File %s: locale=%s, hreflang=%d entries', filepath, locale, file.hreflang.length);
      }

      debug('Processed %d files', filePaths.length);
      done();
    } catch (error) {
      done(new Error(`metalsmith-i18n: ${error.message}`));
    }
  };

  Object.defineProperty(metalsmithPlugin, 'name', {
    value: 'metalsmith-i18n',
    configurable: true,
  });

  return metalsmithPlugin;
}

Object.defineProperty(i18n, 'name', { value: 'metalsmith-i18n' });

export default i18n;
