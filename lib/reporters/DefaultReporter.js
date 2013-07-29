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
 * To be executed when a test is started
 *
 * @param {string} testgroup - Group of tests which will run
 */
DefaultReporter.prototype.onStart = function (testgroup) {
  base.onStart.call(this, testgroup);
};

/**
 * Executed when a test run ends
 * @param {string} testgroup - Group of tests which will run
 * @param {number} duration - time of test run, in ms
 */
DefaultReporter.prototype.onEnd = function (testgroup, duration) {
  console.log('\n--------------------------------------------------------');
  console.log(' ', this.total, 'tests executed in', duration, 'ms');
  console.log(('  ' + this.passed + ' ✓ passes').green);
  console.log(('  ' + this.failed + ' x failures').red);
  console.log(('  ' + this.errored + ' x errors').red);
  console.log('');
};

/**
 * To be executed when a test ends
 *
 * @param {object} results - Test results
 */
DefaultReporter.prototype.onTestEnd = function (results) {
  base.onTestEnd.call(this, results);
  var passed = (results.status === 'PASSED');

  if(this.lastName !== results.name) {
    console.log('');
    console.log('  ', results.name);
    console.log('   --------------------------------------------------------');
    this.lastName = results.name;
  }

  if (passed) {
    console.log('   ✓'.green + ' ' + results.message.green);
  } else {
    console.log('   x'.red + ' ' + results.message.red);

    if (results.stackTrace) {
      console.log('     ' + results.stackTrace.replace(/\n/g, '\n   '));
    }

  }

};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
DefaultReporter.prototype.onPass = function (message) {
  base.onPass.call(this, message);
  // console.log('\r     ✓'.green + ' ' + message.green);
  // console.log('\r');
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
DefaultReporter.prototype.onFail = function (message, stackTrace) {
  base.onFail.call(this, message, stackTrace);
};

/**
 * To be executed when a test errors
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
DefaultReporter.prototype.onError = function (message, stackTrace) {
  base.onError.call(this, message, stackTrace);
};

/**
 * Executed when a test file starts running
 *
 * @param {string} test - the test object
 * @param {string} agent - User agent
 */
DefaultReporter.prototype.onFileStart = function (test, agent) {
  console.log('\n', agent.yellow, test.path);
};

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
DefaultReporter.prototype.onFileEnd = function (runtime) {
  base.onSuiteEnd.call(this, runtime);
  console.log('\r');
  base.onFileEnd.call(this);
};

module.exports = DefaultReporter;
