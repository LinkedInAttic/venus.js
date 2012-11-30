// @author LinkedIn  

// The template for Venus adapters   
// Methods are defined in this class to help process and gather information about test results     
// All adapters need to inherit this class and override methods as needed   
// `Adaptor.prototype = new AdaptorTemplate();`      
function AdaptorTemplate() {

  // Enum object containing possible states for test result    
  // PASSED - test result passed    
  // FAILED - test result failed  
  this.ENUM_STATE = {
    'PASSED' : 'PASSED',
    'FAILED' : 'FAILED'
  };

  // Object that contains test result information    
  // tests - array containing results for each test    
  // done  - object containing summary of test results  
  this.results = {
    tests: [],
    done: {}
  };
};

// Add test result to list of test results   
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

// Process summary of test results    
AdaptorTemplate.prototype.processFinalResults = function(data) {

  this.results.done = {
    passed: this.getTotalPassed(data),
    failed: this.getTotalFailed(data),
    runtime: this.getTotalRuntime(data),
    total: this.getTotal(data) 
  };
};

// Send test results to server    
AdaptorTemplate.prototype.sendResults = function() {
  window.parent.venus.done(this.results);
};

// Override Methods
// ----------------

// Each test suite/framework has their own unique way of processing results. Make sure to 
// override the following methods in order to accurately obtain test results.

// Start and process test results      
AdaptorTemplate.prototype.start = function() {};

// Get message from test result     
AdaptorTemplate.prototype.getTestMessage = function(data) {
  return '';
};

// Get name from test result     
AdaptorTemplate.prototype.getTestName = function(data) {
  return '';
};

// Get status from test result    
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return this.ENUM_STATE.FAILED;
};

// Get stack trace from test result      
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return '';
};

// Get total number of tests    
AdaptorTemplate.prototype.getTotal = function(data) {
  return 0;
};

// Get total number of failed tests    
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return 0;
};

// Get total number of passed tests    
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return 0;
};

// Get total runtime of running all tests    
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return 0;
};