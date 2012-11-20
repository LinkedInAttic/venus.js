/**
 * Create a Jasmine adaptor
 * Inherits AdaptorTemplate class
 * @class Adaptor
 * @constructor
 * @requires .venus/adapters/adaptor-template.js
 */
function Adaptor() {
};

/**
 * Inherit AdaptorTemplate class
 */
Adaptor.prototype = new AdaptorTemplate();

/**
 * @override
 */
Adaptor.prototype.start = function() {
  var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000,
      self = this;

  jasmineEnv.addReporter({
    reportRunnerStarting: function(runner) {
    },
    reportRunnerResults: function(runner) {
      self.processFinalResults(runner);
      self.sendResults();
    },
    reportSuiteResults: function(suite) {
      //console.log('reportSuiteResults:', suite);
    },
    reportSpecStarting: function(spec) {
    },
    reportSpecResults: function(spec) {
      self.addTestResult(spec);
    }
  });

  jasmineEnv.execute();
};

/**
 * @override
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.description || '';
};

/**
 * @override
 */
Adaptor.prototype.getTestName = function(data) {
  var obj = null,
      title = '',
      testName = '';

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

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.results().passedCount === data.results().totalCount ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.results_.items_[0].trace.stack;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.results().totalCount;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.results().failedCount;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.results().passedCount;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return 0;
};
