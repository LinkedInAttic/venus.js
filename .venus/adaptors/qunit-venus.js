/**
 * Initialize a new QUnit adaptor
 */
function Adaptor() {}

/**
 * Start the tests!
 */
Adaptor.prototype.start = function() {

  var results = {
    tests: [],
    done: {}
  };

  // QUnit calback - log
  QUnit.log(function(data) {

    // Retrieve test
    var test = {
      name: data.name,
      status: data.result === true ? 'PASSED' : 'FAILED',
      message: data.message ? data.message : '',
      stackTrace: data.source ? data.source : ''
    };
    results.tests.push(test);
  });

  // QUnit calback - done
  QUnit.done(function(data) {

    // Retrieve final test results
    results.done =  {
      passed: data.passed,
      failed: data.failed,
      runtime: data.runtime,
      total: data.total
    };

    // TO DO: Chrome bug (shows global failure due to Chrome extensions)
    /*if (results.tests.hasOwnProperty(DEFAULT_tests) && results.tests[DEFAULT_tests].hasOwnProperty('global failure')) {
      delete results.tests[DEFAULT_tests]['global failure'];
      results.done.failed--;
      results.done.total--;
    };*/

    window.venus.done(results);
  });
};