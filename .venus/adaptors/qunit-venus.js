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
 * Create a QUnit adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)
 */

/**
 * Creates a new adaptor for QUnit
 */
function Adaptor() {}

// Inherit from adapter template
Adaptor.prototype = new AdaptorTemplate();

/**
 * ### start
 * Start and process test results
 * @method start
 * @return {Void}
 */
Adaptor.prototype.start = function() {
  var self = this,
      fixtureHelper = (typeof FixtureHelper === 'function') ? new FixtureHelper() : false;

  // A single unit test is done
  QUnit.log(function(data) {
    if (fixtureHelper) {
      fixtureHelper.restoreState();
    }
    self.addTestResult(data);
  });

  // All unit tests are done
  QUnit.done(function(data) {
    self.processFinalResults(data);
    self.sendResults();
  });
};

/**
 * ### getTestMessage
 * Get message from test result
 * @method getTestMessage
 * @param {Object} data test result data
 * @return {String} test result message
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.message ? data.message : '';
};

/**
 * ### getTestName
 * Get name from test result
 * @method getTestName
 * @param {Object} data test result data
 * @return {String} test result name
 */
Adaptor.prototype.getTestName = function(data) {
  return data.name;
};

/**
 * ### getTestStatus
 * Get status from test result
 * @method getTestStatus
 * @param {Object} data test result data
 * @return {Boolean} test result status
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.result === true ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * ### getTestStackTrace
 * Get stack trace from test result
 * @method getTestStackTrace
 * @param {Object} data test result data
 * @return {String} test result stack trace
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.source ? data.source : ''
};

/**
 * ### getTotal
 * Get total number of tests
 * @method getTotal
 * @param {Object} data test result data
 * @return {Integer} total number of tests
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.total;
};

/**
 * ### getTotalFailed
 * Get total number of failed tests
 * @method getTotalFailed
 * @param {Object} data test result data
 * @return {Integer} total number of failed tests
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failed;
};

/**
 * ### getTotalPassed
 * Get total number of passed tests
 * @method getTotalPassed
 * @param {Object} data test result data
 * @return {Integer} total number of passed tests
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passed;
};

/**
 * ### getTotalRuntime
 * Get total runtime of running all tests
 * @method getTotalRuntime
 * @param {Object} data test result data
 * @return {Integer} total runtime
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.runtime;
};