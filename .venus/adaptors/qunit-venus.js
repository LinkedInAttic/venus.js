/** 
 * Create a QUnit adapter
 * Inherits AdaptorTemplate class
 * @class Adaptor
 * @constructor
 * @requires .venus/adapters/adaptor-template.js
 */
function Adaptor() {}

/**
 * Inherit AdaptorTemplate class
 */
Adaptor.prototype = new AdaptorTemplate();

/**
 * @override
 */ 
Adaptor.prototype.start = function() {
  var self = this;

  // QUnit calback - log
  QUnit.log(function(data) {
    self.addTestResult(data);
  });

  // QUnit calback - done
  QUnit.done(function(data) {
    self.processFinalResults(data);
    self.sendResults();
  });
};

/**
 * @override
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.message ? data.message : '';
};

/**
 * @override
 */
Adaptor.prototype.getTestName = function(data) {
  return data.name;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.result === true ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.source ? data.source : ''
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.total;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failed;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passed;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.runtime;
};