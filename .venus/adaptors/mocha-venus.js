// @author LinkedIn

// Create a Mocha adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)

// Setup Mocha with behavior driven development (BDD)
function Adaptor() {
  mocha.setup({ ui: 'bdd', ignoreLeaks: true });
};

// Inherit from adapter template
Adaptor.prototype = new AdaptorTemplate();

// Override Methods
// ----------------

// Override methods defined in the adapter template

Adaptor.prototype.start = function() {
  var self = this,
      fixtureHelper = (typeof FixtureHelper === 'function') ? new FixtureHelper() : false;

  var runner = mocha.run();

  runner.globals(['__flash_getWindowLocation', '__flash_getTopLocation']);

  // A single unit test is done
  runner.on('test end', function(data) {
    if (fixtureHelper) {
      fixtureHelper.restoreState();
    }
    self.addTestResult(data);
  });

  // All unit tests are done
  runner.on('HTML_JSON end', function(data) {
    self.processFinalResults(data);
    self.sendResults();
  });

  runner.run();
};

Adaptor.prototype.getTestMessage = function(data) {
  return data.title ? data.title : '';
};

Adaptor.prototype.getTestName = function(data) {
  var obj = null,
      title = '',
      testName = '';

  // Make sure to obtain the proper test name if it is nested within other tests
  var obj = data;
  while (obj.hasOwnProperty('parent')) {
    title = obj.parent.title;
    if (title) {
      !testName ? testName = title : testName = title.concat(' >> ' + testName);
    }
    obj = obj.parent;
  };

  return testName;
};

AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.state === 'passed' ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.hasOwnProperty('err') ? data.err.stack : '';
};

AdaptorTemplate.prototype.getTotal = function(data) {
  return data.passes + data.failures;
};

AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failures;
};

AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passes;
};

AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.milliseconds;
};
