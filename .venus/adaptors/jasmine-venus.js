/**
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 */

/**
 * Create a Jasmine adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)
 */

/**
 * Creates a new adaptor for Jasmine
 */
function Adaptor() {};

// Inherit from adapter template
Adaptor.prototype = new AdaptorTemplate();

/**
 * ### start
 * Start and process test results
 * @method start
 * @return {Void}
 */
Adaptor.prototype.start = function() {
  var jasmineEnv, self, fixtureHelper;

  jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;
  self = this;
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

/**
 * ### getTestMessage
 * Get message from test result
 * @method getTestMessage
 * @param {Object} data test result data
 * @return {String} test result message
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.description || '';
};

/**
 * ### getTestName
 * Get name from test result
 * @method getTestName
 * @param {Object} data test result data
 * @return {String} test result name
 */
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

/**
 * ### getTestStatus
 * Get status from test result
 * @method getTestStatus
 * @param {Object} data test result data
 * @return {Boolean} test result status
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.results().passedCount === data.results().totalCount ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * ### getTestStackTrace
 * Get stack trace from test result
 * @method getTestStackTrace
 * @param {Object} data test result data
 * @return {String} test result stack trace
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  try {
    return data.results_.items_[0].trace.stack;
  } catch(e) {
    return '';
  }
};

/**
 * ### getTotal
 * Get total number of tests
 * @method getTotal
 * @param {Object} data test result data
 * @return {Integer} total number of tests
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.results().totalCount;
};

/**
 * ### getTotalFailed
 * Get total number of failed tests
 * @method getTotalFailed
 * @param {Object} data test result data
 * @return {Integer} total number of failed tests
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.results().failedCount;
};

/**
 * ### getTotalPassed
 * Get total number of passed tests
 * @method getTotalPassed
 * @param {Object} data test result data
 * @return {Integer} total number of passed tests
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.results().passedCount;
};

/**
 * ### getTotalRuntime
 * Get total runtime of running all tests
 * @method getTotalRuntime
 * @param {Object} data test result data
 * @return {Integer} total runtime
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return 0;
};
