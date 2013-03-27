# Changelog

## 1.0.8 (unpublished)

-- Venus now writes temporary files to user's home directory (~/.venus_temp) instead of to folder where venus is installed

## 1.0.7

-- Added example of testing Require.js modules

## 1.0.6

-- Fixed issue with Venus not returning proper exit codes

## 1.0.5

Skipped release

## 1.0.4

-- Misc. bug fixes

## 1.0.3

- basePaths now supported as a config option in the .venus/config file.
- Custom UACs can now be used with the new --uac flag

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
