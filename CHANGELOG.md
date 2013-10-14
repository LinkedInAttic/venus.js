# Changelog

## 2.3.1

* Fixed bug with running tests with original syntax `venus run -t test.js -n` (#300)
* Added directory support for `@venus-resource` annotation (#300)


## 2.3.0

* Added `@venus-execute` annotation for running code on node before executing tests. See `examples/Hooks` for usage.

## 2.2.0

* Added support for external resources via `@venus-resource` (#294)

## 2.1.14

* Fixed bug in JUnitReporter (needed to escape quotes in attribute values) (#288)


## 2.1.12

* Default to `run` command to simplify running tests, e.g.: `venus test.js` will now work the same as `venus run -t test.js` (#281)
* Tests will now automatically re-run when they, or any of their dependent files, change (#285)
* Default IP address changed from 0.0.0.0 to 127.0.0.1 (#282)
* Fixed minor XSS issue in browser runner UI (#260)
* Fixed @venus-include path issue with relative `./` paths (#284)


## 2.1.11

* Increased performance of running Venus with PhantomJS (#280)


## 2.1.10

* Changed include order of scripts on test harness page (PR #279)


## 2.1.9

* Tweak to give phantomjs more time to initialize with GhostDriverUac

## 2.1.8

* Running with code coverage `--coverage` flag will now write out coverage.csv with coverage data


## 2.1.7

* Fixed bugs with running Venus on IE7/8 (#277)


## 2.1.6

* Hotfix to give phantomjs process more time to initialize with GhostDriverUac (#276)

## 2.1.5

* Test errors (tests that can't run) are now logged (#274)
* PhantomJS is killed before starting GhostDriverUac, to try to cut down on stray processes (#274)


## 2.1.4

* phantomjs process output is now printed in debug mode (#273)


## 2.1.3

* Updated JUnitReporter to also output results in console for debugability (#272)


## 2.1.2

* New `--singleton` flag to ensure current all other Venus servers are killed before continuing (#271)
* Fixed an issue where tests could fail to run due to port mismatch between venus server and generated test urls (#270)
* Fixed `venus demo` command to work correctly (#266)


## 2.1.1

* New test reporter for TAP format (#263)


## 2.1.0

* New annotation: `@venus-code` (#258). This works exactly the same as `@venus-include`, but should be used to pull in the code that is under test. This annotation will indicate to venus that the file should be instrumented for code coverage, if the `--coverage` flag is set.
* Fixed issue where Mocha tests were being executed twice.


## 2.0.0alpha7

* Critical fix for Jasmine adaptor in IE7-9.


## 2.0.0alpha6

* Added Test Result Summary view, so you can see all test results at once in browser (#247)
* Fixed bug in test fixture sandbox for latest firefox


## 2.0.0alpha5

* Upgraded Mocha to 1.12.0
* Fixed `--hostname` flag to work correctly
* Serving static content with the `static` config option now correctly resolves paths relative to the venus config file
* Static content is now served through symlinks rather than copying all files to temporary folder
* Updates to JUnitReporter to improve format of test results
* Added initial set of integration tests

## 2.0.0alpha4

* New Web Runner UI -- see test results directly in the browser.

## 2.0.0alpha3

* Added project documentation to main repository, under /docs
* Fixed demo mode to work correctly by pointing it at the new `ghost` environment (#234)
* Added backwards compat fix to restore functionality of `--phantom` flag (#234)

## 2.0.0alpha2

* Custom test reporters are now supported. By default, three are available: DefaultReporter, DotReporter and JUnitReporter
* To use, specify the new `--reporter` flag. Example: `venus run --test tests --reporter DotReporter`

## 2.0.0alpha1

* New syntax for specifying test environments (selenium, sauce labs, phantomjs)
* To run tests with phantom, we now use GhostDriver. `venus run --test test.js --environment ghost`¬
* Running large number of tests at once is now more stable and less resource intensive¬
* By default, Venus tests must now include at least one @venus-* annotation. Use the `--no-annotations` flag to override this behavior.

## 1.1.3

* Fixed issue where PhantomJS path specified in config files was not being resolved properly (#221)

## 1.1.2

* Hot reloading is now supported -- you no longer need to restart Venus when making code or test change (#219, #220)
* Venus config file resolution now works relative to test files, rather than CWD (#218)

## 1.1.1

* Fixed issue with serving static content (#215)

## 1.1.0

* You can now run tests with Sauce Labs (#207)
* Console.log forwarding now works correctly in IE (#209)
* JSHINT style comments now work correctly in test files (#212)

## 1.0.10

* Updated syntax for running tests with selenium webdriver. New syntax: `venus run -t spec.js --selenium grid_url --browser chrome|20.0`
* Changed test urls to use system IP address instead of hostname. Can manually set hostname with either `--hostname` command line flag, or `hostname: 'myhost'` property in config file
* Fixed bug which prevented mocha tests from running on IE

## 1.0.9

* Venus is now smarter about finding the right path for phantomjs

## 1.0.8

* Venus now writes temporary files to user's home directory (~/.venus_temp) instead of to folder where venus is installed

## 1.0.7

* Added example of testing Require.js modules

## 1.0.6

* Fixed issue with Venus not returning proper exit codes

## 1.0.5

Skipped release

## 1.0.4

* Misc. bug fixes

## 1.0.3

* basePaths now supported as a config option in the .venus/config file.
* Custom UACs can now be used with the new --uac flag

## 1.0.2

* New demo mode: `venus demo`. This will run a sample test, with phantomjs and code coverage enabled.
* New flag `--require-annotations'. If you use this flag, Venus will not parse a JS file as a test case unless it has at least one `@venus-*` annotation.
* New config option: basePaths. { basePaths: { 'ROOT': '../../' } }. ROOT then can be used in `@venus-include ROOT/file.js`.

## 1.0.1

* Code coverage now available (use --coverage flag to turn on)
* Support for custom routes in .venus/config
* Some performance optimizations around how Venus reads files from disk

## 1.0.0

* initial public release
