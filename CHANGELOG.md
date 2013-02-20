# Changelog

## 1.0.3 (unreleased)

- basePaths now supported as a config option in the .venus/config file.

## 1.0.2

- New demo mode: `venus demo`. This will run a sample test, with phantomjs and code coverage enabled.
- New flag `--require-annotations'. If you use this flag, Venus will not parse a JS file as a test case unless it has at least one `@venus-*` annotation.
- New config option: basePaths. { basePaths: { 'ROOT': '../../' } }. ROOT then can be used in `@venus-include ROOT/file.js`.

## 1.0.1

- Code coverage now available (use --coverage flag to turn on)
- Support for custom routes in .venus/config
- Some performance optimizations around how Venus reads files from disk

## 1.0.0

- initial public release
