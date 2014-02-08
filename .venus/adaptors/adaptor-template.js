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
 * The template for Venus adapters.
 * Methods are defined in this class to help process and gather information about test results.
 * All adapters need to inherit this class and override methods as needed.
 */

/**
 * Creates a new adaptor template
 */
function AdaptorTemplate() {

  // Enum for test result states:
  //
  // - PASSED: test result passed
  // - FAILED: test result failed
  this.ENUM_STATE = {
    'PASSED' : 'PASSED',
    'FAILED' : 'FAILED'
  };

  // Object for test result information:
  //
  // - tests: array containing results for each test
  // - done:  object containing summary of test results
  this.results = {
    tests: [],
    done: {}
  };
}

/**
 * ### addTestResult
 * Normalize and add test result to list of test results
 * @method addTestResult
 * @param {Object} data test result data
 * @return {Void}
 */
AdaptorTemplate.prototype.addTestResult = function(data) {
  var test = {};

  test = {
    name: this.getTestName(data),
    status: this.getTestStatus(data),
    message: this.getTestMessage(data),
    stackTrace: this.getTestStackTrace(data)
  };

  this.results.tests.push(test);
};

/**
 * ### processFinalResults
 * Once all unit tests are done, process summary of test results
 * @method processFinalResults
 * @param {Object} data test result data
 * @return {Void}
 */
AdaptorTemplate.prototype.processFinalResults = function(data) {

  this.results.done = {
    passed: this.getTotalPassed(data),
    failed: this.getTotalFailed(data),
    runtime: this.getTotalRuntime(data),
    total: this.getTotal(data)
  };
};

/**
 * ### sendResults
 * Send test results to server
 * @method sendResults
 * @return {Void}
 */
AdaptorTemplate.prototype.sendResults = function() {
  window.parent.venus.done(this.results);
};

/**
 * ### start
 * Start and process test results
 * @method start
 * @return {Void}
 */
AdaptorTemplate.prototype.start = function() {};

/**
 * ### getTestMessage
 * Get message from test result
 * @method getTestMessage
 * @param {Object} data test result data
 * @return {String} test result message
 */
AdaptorTemplate.prototype.getTestMessage = function(data) {
  return '';
};

/**
 * ### getTestName
 * Get name from test result
 * @method getTestName
 * @param {Object} data test result data
 * @return {String} test result name
 */
AdaptorTemplate.prototype.getTestName = function(data) {
  return '';
};

/**
 * ### getTestStatus
 * Get status from test result
 * @method getTestStatus
 * @param {Object} data test result data
 * @return {Boolean} test result status
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return this.ENUM_STATE.FAILED;
};

/**
 * ### getTestStackTrace
 * Get stack trace from test result
 * @method getTestStackTrace
 * @param {Object} data test result data
 * @return {String} test result stack trace
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return '';
};

/**
 * ### getTotal
 * Get total number of tests
 * @method getTotal
 * @param {Object} data test result data
 * @return {Integer} total number of tests
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return 0;
};

/**
 * ### getTotalFailed
 * Get total number of failed tests
 * @method getTotalFailed
 * @param {Object} data test result data
 * @return {Integer} total number of failed tests
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return 0;
};

/**
 * ### getTotalPassed
 * Get total number of passed tests
 * @method getTotalPassed
 * @param {Object} data test result data
 * @return {Integer} total number of passed tests
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return 0;
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