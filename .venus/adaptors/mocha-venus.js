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

   // Mocha calback - test end
   .on('test end', function(data) {

      var test = null,
          obj = null,
          title = '',
          testName = '';

      // Retrieve name of test
      var obj = data;
      while (obj.hasOwnProperty('parent')) {
        title = obj.parent.title;
        if (title) {
          !testName ? testName = title : testName = title.concat(' >> ' + testName);
        }
        obj = obj.parent;
      };

      // Normalize test results
      var test = {
        name: testName,
        status: data.state === 'passed' ? 'PASSED' : 'FAILED',
        message: data.title,
        stackTrace: data.hasOwnProperty('err') ? data.err.stack : ''
      };
      results.tests.push(test);
   })

   // Mocha calback - HTML_JSON end
   .on('HTML_JSON end', function(data) {

      // Normalize test summary
      results.done =  {
        passed: data.passes,
        failed: data.failures,
        runtime: data.milliseconds,
        total: data.passes + data.failures
      };

      window.parent.venus.done(results);
   });
};