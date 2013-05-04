var events = require('events'),
    util = require('util');

/**
 * Tests reporter
 */
var Reporter = function() {
  this.init();
};

// We want to listen for events
util.inherits(Reporter, events.EventEmitter);

/**
 * Bind all event listeners
 */
Reporter.prototype.init = function() {
  this.on('start', this.onStart);
  this.on('pass', this.onPass);
  this.on('fail', this.onFail);
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
Reporter.prototype.onStart = function(testName) {
  console.log('\n   ' + testName);
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
Reporter.prototype.onPass = function(message) {
  console.log('\r     ✓'.green + ' ' + message.green);
  console.log('\r');
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
Reporter.prototype.onFail = function(message, stackTrace) {
  console.log('\r     x'.red + ' ' + message.red);

  if (stackTrace) {
    console.log('\r   ' + stackTrace);
  }

  console.log('\r');
};

module.exports.Reporter = Reporter;
