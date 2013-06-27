/*
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
 **/
var util         = require('util'),
    BaseReporter = require('./BaseReporter'),
    base         = new BaseReporter();

/**
 * Tests reporter
 */
function DefaultReporter() {
  BaseReporter.call(this);
}

// We want to listen for events
util.inherits(DefaultReporter, BaseReporter);

/**
 * Executed when a test suite is started
 *
 * @param {string} agent - User agent
 */
DefaultReporter.prototype.onFile = function (agent) {
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
DefaultReporter.prototype.onStart = function (testName) {
  base.onStart.call(this, testName);
  console.log('\n   ' + testName);
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
DefaultReporter.prototype.onPass = function (message) {
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
DefaultReporter.prototype.onFail = function (message, stackTrace) {
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
DefaultReporter.prototype.onFileEnd = function (runtime) {
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

  base.onFileEnd.call(this);
};

module.exports = DefaultReporter;
