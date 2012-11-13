/** 
 * Create a Mocha adaptor
 * Inherits AdaptorTemplate class
 * @class Adaptor
 * @constructor
 * @requires .venus/adapters/adaptor-template.js
 */
function Adaptor() {
  mocha.setup('bdd');
};

/**
 * Inherit AdaptorTemplate class
 */
Adaptor.prototype = new AdaptorTemplate();

/**
 * @override
 */ 
Adaptor.prototype.start = function() {
  var self = this;

  mocha.run()
    .globals(['__flash_getWindowLocation', '__flash_getTopLocation'])

  // Mocha calback - test end
  .on('test end', function(data) {
    self.addTestResult(data);
  })

  // Mocha calback - HTML_JSON end
  .on('HTML_JSON end', function(data) {
    self.processFinalResults(data);
    self.sendResults();
  });
};

/**
 * @override
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.title ? data.title : '';
};

/**
 * @override
 */
Adaptor.prototype.getTestName = function(data) {
  var obj = null,
      title = '',
      testName = '';

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

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.state === 'passed' ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.hasOwnProperty('err') ? data.err.stack : '';
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.passes + data.failures;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failures;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passes;
};

/**
 * @override
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.milliseconds;
};