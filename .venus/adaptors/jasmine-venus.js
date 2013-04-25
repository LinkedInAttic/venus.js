// @author LinkedIn

// Create a Jasmine adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)    

// Instantiate adaptor
function Adaptor() {};

// Inherit from adapter template
Adaptor.prototype = new AdaptorTemplate();

// Override Methods
// ----------------

// Override methods defined in the adapter template

Adaptor.prototype.start = function() {
  var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000,
      self = this,
      fixtureHelper = (typeof FixtureHelper === 'function') ? new FixtureHelper() : false;

  jasmineEnv.addReporter({
    reportRunnerStarting: function(runner) {
    },
    reportRunnerResults: function(runner) {

      // All unit tests are done
      self.processFinalResults(runner);
      self.sendResults();
    },
    reportSuiteResults: function(suite) {
    },
    reportSpecStarting: function(spec) {
    },
    reportSpecResults: function(spec) {
      if (fixtureHelper) {
        fixtureHelper.restoreState();
      }
      // A single unit test is done
      self.addTestResult(spec);
    }
  });

  jasmineEnv.execute();
};

Adaptor.prototype.getTestMessage = function(data) {
  return data.description || '';
};

Adaptor.prototype.getTestName = function(data) {
  var obj = null,
      title = '',
      testName = '';

  // Make sure to obtain the proper test name if it is nested within other tests
  var obj = data;
  while (obj.hasOwnProperty('suite')) {
    title = obj.suite.description;
    if (title) {
      !testName ? testName = title : testName = title.concat(' >> ' + testName);
    }
    obj = obj.suite;
  };
  return testName;
};

AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.results().passedCount === data.results().totalCount ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};


AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  try {
    return data.results_.items_[0].trace.stack;
  } catch(e) {
    return '';
  }
};

AdaptorTemplate.prototype.getTotal = function(data) {
  return data.results().totalCount;
};

AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.results().failedCount;
};

AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.results().passedCount;
};

AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return 0;
};
