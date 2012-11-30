// @author LinkedIn  

// Create a QUnit adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)  

// Instantiate adaptor  
function Adaptor() {}

// Inherit from adapter template    
Adaptor.prototype = new AdaptorTemplate();

// Override Methods
// ----------------

// Override methods defined in the adapter template       

Adaptor.prototype.start = function() {
  var self = this;

  // A single unit test is done    
  QUnit.log(function(data) {
    self.addTestResult(data);
  });

  // All unit tests are done    
  QUnit.done(function(data) {
    self.processFinalResults(data);
    self.sendResults();
  });
};

Adaptor.prototype.getTestMessage = function(data) {
  return data.message ? data.message : '';
};

Adaptor.prototype.getTestName = function(data) {
  return data.name;
};

AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.result === true ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.source ? data.source : ''
};

AdaptorTemplate.prototype.getTotal = function(data) {
  return data.total;
};

AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failed;
};

AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passed;
};

AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.runtime;
};