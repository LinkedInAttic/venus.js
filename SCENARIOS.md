1. Run unit tests


Types of plugins:

  - Framework (mocha, jasmine, etc.)
    Register to be invoked from @framework annotations

  - Preprocessor.
    Transform script files, examples:
    @code ../*.cs [coffee-script, sweet]

  - Reporter.
    Specified in .venusrc or from command line.
    Multiple reporters may be used.


*Pipeline*

1. Create test harness object, 1:1 mapping to test file
   Hooks:
    - FRAMEWORK scripts
    - INCLUDED scripts
    - CODE scripts
    - DOM fixtures
2. Parse annotations from test file
3. Execute transformations.
4. Ask framework plugin for harness HTML


// Mocha Framework Plugin
module.exports = {
  /* async */
  harnessHTML: function (testHarness) {

  }
};

venus-coffee
venus-browserify
venus-requirejs
