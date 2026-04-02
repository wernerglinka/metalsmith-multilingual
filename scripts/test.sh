#!/bin/bash
# Test runner with coverage scoped to src/ only
# Shell script avoids npm's double-shell glob expansion issues

node --test \
  --experimental-test-coverage \
  --test-coverage-exclude='test/**' \
  "$@" \
  test/index.test.js \
  test/unit/dot-path.test.js \
  test/unit/locale-detector.test.js \
  test/unit/hreflang-builder.test.js
