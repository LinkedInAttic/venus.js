var util = require('util'),
    Base = require('./base').Base,
    base = new Base();

/**
 * Tests reporter
 */
var Default = function() {
  Base.call(this);
};

// We want to listen for events
util.inherits(Default, Base);

/**
 * Executed when a test suite is started
 *
 * @param {string} agent - User agent
 */
Default.prototype.onSuite = function(agent) {
  base.onSuite.call(this, agent);

  console.log('\n--------------------------------------------------------');
  console.log('\n');
  console.log(agent.yellow);
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
Default.prototype.onStart = function(testName) {
  base.onStart.call(this, testName);

  console.log('\n   ' + testName);
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
Default.prototype.onPass = function(message) {
  base.onPass.call(this, message);
  console.log('\r     ✓'.green + ' ' + message.green);
  console.log('\r');
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
Default.prototype.onFail = function(message, stackTrace) {
  base.onFail.call(this, message, stackTrace);

  console.log('\r     x'.red + ' ' + message.red);

  if (stackTrace) {
    console.log('\r   ' + stackTrace);
  }

  console.log('\r');
};

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
Default.prototype.onSuiteEnd = function(runtime) {
  base.onSuiteEnd.call(this, runtime);

  if (this.failed === 0) {
    var content = this.passed === 1 ? ' test completed' : ' tests completed',
    message = '\n✓' + ' ' + this.passed.toString() + content + ' (' +
        runtime.toString()  + 'ms)';

    console.log(message.green);
  } else {
    var content = this.failed === 1 ? ' test failed' : ' tests failed',
    message = '\nx' + ' ' + this.failed.toString() + ' of ' +
        this.total.toString() + content + ' (' + runtime.toString()  + 'ms)';

    console.log(message.red);
  }

  console.log('\r');
};

module.exports.Default = Default;
