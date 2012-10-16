/** 
 * The template for Venus adapters
 * Methods are defined in this class to help process and gather information about test results
 * All adapters need to inherit this class and override methods as needed
 * <xmp>
 *  Adaptor.prototype = new AdaptorTemplate();
 * </xmp>
 * @class AdaptorTemplate
 * @constructor
 */
function AdaptorTemplate() {

  /**
   * Enum object containing possible states for test result
   * PASSED - test result passed
   * FAILED - test result failed
   */
  this.ENUM_STATE = {
    'PASSED' : 'PASSED',
    'FAILED' : 'FAILED'
  };

  /**
   * Object that contains test result information
   * tests - list containing results for each test
   * done  - object containing summary of test results
   */
  this.results = {
    tests: [],
    done: {}
  };
};

/**
 * Start and process test results
 * NOTE: Override this method in adapter
 * @method start
 */
AdaptorTemplate.prototype.start = function() {};

/**
 * Get message for test 
 * NOTE: Override this method in adapter
 * @method getTestMessage
 * @param {Object} data Object containing results for test
 * @returns {String} Test message
 */
AdaptorTemplate.prototype.getTestMessage = function(data) {
  return '';
};

/**
 * Get test name
 * NOTE: Override this method in adapter
 * @method getTestName
 * @param {Object} data Object containing results for test
 * @returns {String} Test name
 */
AdaptorTemplate.prototype.getTestName = function(data) {
  return '';
};

/**
 * Get status of test
 * NOTE: Override this method in adapter
 * @method getTestStatus
 * @param {Object} data Object containing results for test
 * @returns {String} Status
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return this.ENUM_STATE.FAILED;
};

/**
 * Get stack trace for test
 * NOTE: Override this method in adapter
 * @method getTestStackTrace
 * @param {Object} data Object containing results for test
 * @returns {String} Stack trace
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return '';
};

/**
 * Get total number of tests
 * NOTE: Override this method in adapter
 * @method getTotal
 * @param {Object} data Object containing summary of test results
 * @returns {Number} Total number of tests
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return 0;
};

/**
 * Get number of tests that failed
 * NOTE: Override this method in adapter
 * @method getTotalFailed
 * @param {Object} data Object containing summary of test results
 * @returns {Number} Number of tests that failed
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return 0;
};

/**
 * Get number of tests that passed
 * NOTE: Override this method in adapter
 * @method getTotalPassed
 * @param {Object} data Object containing summary of test results
 * @returns {Number} Number of tests that passed
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return 0;
};

/**
 * Get runtime of running all tests
 * NOTE: Override this method in adapter
 * @method getTotalRuntime
 * @param {Object} data Object containing summary of test results
 * @returns {Number} Runtime
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return 0;
};

/**
 * Process test result and add to list of test results
 * @method addTestResult
 * @param {Object} data Object containing results for test
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
 * Process summary of test results
 * @method processFinalResults
 * @param {Object} data Object containing summary of test results
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
 * Send test results to server
 * @method sendResults
 */ 
AdaptorTemplate.prototype.sendResults = function() {
  window.parent.venus.done(this.results);
};