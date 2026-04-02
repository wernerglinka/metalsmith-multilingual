# metalsmith-i18n

A Metalsmith plugin that adds internationalization metadata to files based on directory structure and frontmatter alternate links

[![metalsmith:plugin][metalsmith-badge]][metalsmith-url]
[![npm: version][npm-badge]][npm-url]
[![license: MIT][license-badge]][license-url]
[![coverage][coverage-badge]][coverage-url]
[![ESM][modules-badge]][npm-url]
[![Known Vulnerabilities](https://snyk.io/test/npm/metalsmith-i18n/badge.svg)](https://snyk.io/test/npm/metalsmith-i18n)
[![AI-assisted development](https://img.shields.io/badge/AI-assisted-blue)](https://github.com/wernerglinka/metalsmith-i18n/blob/main/CLAUDE.md)

> This Metalsmith plugin is under active development. The API is stable, but breaking changes may occur before reaching 1.0.0.

## Features

- **Directory-based locale detection** - Detects each file's locale from its path (e.g. files under `de/` are German)
- **hreflang generation** - Builds `<link rel="alternate" hreflang="...">` data from frontmatter cross-references
- **Global i18n metadata** - Exposes locale configuration via `metalsmith.metadata()` for templates
- **Configurable path patterns** - Supports custom directory structures for locale detection
- **Configurable alternate key** - Reads cross-language links from any frontmatter path via dot notation
- **Translated URL slugs** - Works with fully translated paths (e.g. `works/` vs `werke/`), not just locale prefixes
- **ESM module**: `import i18n from 'metalsmith-i18n'`

## Installation

```bash
npm install metalsmith-i18n
```

## Usage

Pass `metalsmith-i18n` to `metalsmith.use`:

### Basic Usage

```js
import Metalsmith from 'metalsmith';
import i18n from 'metalsmith-i18n';

Metalsmith(__dirname)
  .use(i18n())
  .build((err) => {
    if (err) throw err;
  });
```

### With Custom Options

```js
import Metalsmith from 'metalsmith';
import i18n from 'metalsmith-i18n';

Metalsmith(__dirname)
  .use(
    i18n({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      pathPattern: '{locale}/**',
      alternateKey: 'seo.alternate',
      localeLabels: { en: 'English', de: 'Deutsch' }
    })
  )
  .build((err) => {
    if (err) throw err;
  });
```

### Options

| Option | Description | Type | Default |
| --- | --- | --- | --- |
| `defaultLocale` | Fallback locale for files not matching any locale path | `String` | `'en'` |
| `locales` | Array of supported locale codes | `String[]` | `['en', 'de']` |
| `pathPattern` | Pattern for detecting locale from file path. Must contain `{locale}` | `String` | `'{locale}/**'` |
| `alternateKey` | Dot-path to alternate links in frontmatter | `String` | `'seo.alternate'` |
| `localeLabels` | Map of locale codes to human-readable labels | `Object` | `{ en: 'English', de: 'Deutsch' }` |

## How It Works

The plugin detects each file's locale from its path and enriches it with i18n metadata. It expects your content to be organized with locale-specific directories and frontmatter cross-references between language versions.

### Content Structure

```
src/
  index.md                      # English (default locale)
  works/2026.03.002.md          # English artwork page
  studio-notes/first-piece.md   # English studio note
  de/
    index.md                    # German homepage
    werke/2026.03.002.md        # German artwork page
    studio-notizen/erstes-stueck.md  # German studio note
```

Files under `de/` get `locale: 'de'`. All other files get the default locale `'en'`. The plugin supports fully translated URL slugs — it does not require matching directory names across languages.

### Frontmatter Cross-References

Each page links to its alternate language version via frontmatter:

```yaml
# English page (src/works/2026.03.002.md)
seo:
  title: 'Wall sculpture with laminated cardboard'
  alternate:
    de: /de/werke/2026.03.002/

# German page (src/de/werke/2026.03.002.md)
seo:
  title: 'Wandskulptur mit laminierten Kartonstreifen'
  alternate:
    en: /works/2026.03.002/
```

The plugin reads these cross-references (via the configurable `alternateKey`) but does not create them — you maintain the links in your content.

### Per-File Metadata

After the plugin runs, each file has:

| Property | Type | Description |
| --- | --- | --- |
| `locale` | `String` | The detected locale code (e.g. `'en'` or `'de'`) |
| `isDefaultLocale` | `Boolean` | `true` when the file's locale matches `defaultLocale` |
| `hreflang` | `Array` | Array of `{ lang, url }` objects for all language versions |

The `hreflang` array includes a self-referencing entry, entries for each alternate language from frontmatter, and an `x-default` entry pointing to the default locale URL. This data can be used directly in templates to render `<link rel="alternate" hreflang="...">` tags.

Example `hreflang` output for the English homepage:

```json
[
  { "lang": "en", "url": "/" },
  { "lang": "de", "url": "/de/" },
  { "lang": "x-default", "url": "/" }
]
```

### Global Metadata

The plugin adds an `i18n` object to `metalsmith.metadata()`:

```json
{
  "defaultLocale": "en",
  "locales": [
    { "code": "en", "label": "English", "isDefault": true },
    { "code": "de", "label": "Deutsch", "isDefault": false }
  ],
  "localeLabels": { "en": "English", "de": "Deutsch" }
}
```

This is available in templates for rendering language switchers, navigation filtering, and other locale-aware UI.

## Development

This plugin uses [Biome](https://biomejs.dev/) for linting and formatting — a single Rust-based tool that replaces both ESLint and Prettier.

```bash
# Lint and format in one pass (with auto-fix)
npm run check

# Lint only
npm run lint

# Format only
npm run format

# Check without writing (CI mode)
npm run check:ci
```

## Test Coverage

This plugin is tested using Node's built-in test runner (`node:test`) with built-in V8 coverage.

## Debug

To enable debug logs, set the `DEBUG` environment variable to `metalsmith-i18n*`:

```js
metalsmith.env('DEBUG', 'metalsmith-i18n*');
```

Alternatively, you can set `DEBUG` to `metalsmith:*` to debug all Metalsmith plugins.

## CLI Usage

To use this plugin with the Metalsmith CLI, add `metalsmith-i18n` to the `plugins` key in your `metalsmith.json` file:

```json
{
  "plugins": [
    {
      "metalsmith-i18n": {
        "defaultLocale": "en",
        "locales": ["en", "de"],
        "alternateKey": "seo.alternate",
        "localeLabels": {
          "en": "English",
          "de": "Deutsch"
        }
      }
    }
  ]
}
```

## License

MIT

## Development transparency

Portions of this project were developed with the assistance of AI tools including Claude and Claude Code. These tools were used to:

- Generate or refactor code
- Assist with documentation
- Troubleshoot bugs and explore alternative approaches

All AI-assisted code has been reviewed and tested to ensure it meets project standards. See the included [CLAUDE.md](CLAUDE.md) for more details.

[npm-badge]: https://img.shields.io/npm/v/metalsmith-i18n.svg
[npm-url]: https://www.npmjs.com/package/metalsmith-i18n
[metalsmith-badge]: https://img.shields.io/badge/metalsmith-plugin-green.svg?longCache=true
[metalsmith-url]: https://metalsmith.io
[license-badge]: https://img.shields.io/github/license/wernerglinka/metalsmith-i18n
[license-url]: LICENSE
[coverage-badge]: https://img.shields.io/badge/test%20coverage-99%25-brightgreen
[coverage-url]: #test-coverage
[modules-badge]: https://img.shields.io/badge/modules-ESM-blue
