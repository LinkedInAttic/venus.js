var events = require('events'),
    util = require('util');

/**
 * Tests reporter
 */
var Base = function() {
  this.failures = [];
  this.resetCounters();
  this.init();
};

// We want to listen for events
util.inherits(Base, events.EventEmitter);

/**
 * Bind all event listeners
 */
Base.prototype.init = function() {
  this.on('suite', this.onSuite);
  this.on('file', this.onFile);
  this.on('start', this.onStart);
  this.on('pass', this.onPass);
  this.on('fail', this.onFail);
  this.on('end', this.onEnd);
  this.on('file_end', this.onFileEnd);
  this.on('suite_end', this.onSuiteEnd);
};

/**
 * Executed when a test suite is started
 */
Base.prototype.onSuite = function() {
};

/**
 * Executed when a test file starts running
 *
 * @param {string} agent - User agent
 */
Base.prototype.onFile = function(agent) {
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
Base.prototype.onStart = function(testName) {
  this.total++;
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
Base.prototype.onPass = function(message) {
  this.passed++;
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
Base.prototype.onFail = function(message, stackTrace) {
  this.failed++;

  this.failures.push({
    message: message,
    stackTrace: stackTrace
  });
};

/**
 * To be executed when a test is finished
 */
Base.prototype.onEnd = function() {
};

/**
 * Executed when a test file execution finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
Base.prototype.onFileEnd = function(runtime) {
  this.failures = [];
  this.resetCounters();
};


/**
 * Executed when a test suite finishes
 */
Base.prototype.onSuiteEnd = function() {
  this.failures = [];
  this.resetCounters();
};

/**
 * Reset test counters
 */
Base.prototype.resetCounters = function() {
  this.total = 0;
  this.passed = 0;
  this.failed = 0;
};

module.exports.Base = Base;
