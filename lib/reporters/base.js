var events = require('events'),
    util = require('util'),
    total = 0,
    passed = 0,
    failed = 0;

/**
 * Tests reporter
 */
var Base = function() {
  this.init();
};

// We want to listen for events
util.inherits(Base, events.EventEmitter);

/**
 * Bind all event listeners
 */
Base.prototype.init = function() {
  this.on('suite', this.onSuite);
  this.on('start', this.onStart);
  this.on('pass', this.onPass);
  this.on('fail', this.onFail);
  this.on('end', this.onEnd);
  this.on('suite_end', this.onSuiteEnd);
};

/**
 * Executed when a test suite is started
 *
 * @param {string} agent - User agent
 */
Base.prototype.onSuite = function(agent) {
  console.log('\n--------------------------------------------------------');
  console.log('\n');
  console.log(agent.yellow);
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
Base.prototype.onStart = function(testName) {
  total++;

  console.log('\n   ' + testName);
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
Base.prototype.onPass = function(message) {
  passed++;

  console.log('\r     ✓'.green + ' ' + message.green);
  console.log('\r');
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
Base.prototype.onFail = function(message, stackTrace) {
  failed++;

  console.log('\r     x'.red + ' ' + message.red);

  if (stackTrace) {
    console.log('\r   ' + stackTrace);
  }

  console.log('\r');
};

/**
 * To be executed when a test is finished
 */
Base.prototype.onEnd = function() {
};

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
Base.prototype.onSuiteEnd = function(runtime) {
  if (failed === 0) {
    var content = passed === 1 ? ' test completed' : ' tests completed',
    message = '\n✓' + ' ' + passed.toString() + content + ' (' +
        runtime.toString()  + 'ms)';

    console.log(message.green);
  } else {
    var content = failed === 1 ? ' test failed' : ' tests failed',
    message = '\nx' + ' ' + failed.toString() + ' of ' + total.toString() +
        content + ' (' + runtime.toString()  + 'ms)';

    console.log(message.red);
  }

  console.log('\r');

  total = 0;
  passed = 0;
  failed = 0;
};

module.exports.Base = Base;
