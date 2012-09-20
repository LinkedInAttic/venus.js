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

    window.parent.venus.done(results);
  });
};