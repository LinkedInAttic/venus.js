/**
 * Initialize a new Mocha adaptor
 */
function Adaptor() {
  mocha.setup('bdd');
};

/**
 * Start the tests!
 */
Adaptor.prototype.start = function() {

  var results = {
    tests: [],
    done: {}
  };

  mocha.run()
   .globals(['__flash_getWindowLocation', '__flash_getTopLocation'])

   // Mocha calback - HTML_JSON end
   .on('HTML_JSON end', function(data) {

      // Retrieve test
      $(data.suites).each(function(index, suite) {

        // TO DO: Handle tests with multiple describes
        if (suite.hasOwnProperty('test')) {
          var obj = suite.test[0];
          var test = {
            name: suite.title,
            status: obj.status === 'passed' ? 'PASSED' : 'FAILED',
            message: obj.title ? obj.title : '',
            stackTrace: obj.str ? obj.str : ''
          };
          results.tests.push(test);
        };
      });

      // Retrieve final test results
      results.done =  {
        passed: data.passes,
        failed: data.failures,
        runtime: data.milliseconds,
        total: data.passes + data.failures
      };

      window.venus.done(results);
   });
};