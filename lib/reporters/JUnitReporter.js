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
function JUnitReporter(outputFile) {
  BaseReporter.call(this, outputFile);
}

// We want to listen for events
util.inherits(JUnitReporter, BaseReporter);

/**
 * Executed at the beginning of a test run
 */
JUnitReporter.prototype.onStart = function () {
  base.onSuite.call(this);
  this.log('<testsuites>');
};

/**
 * Executed at the end of a test run
 */
JUnitReporter.prototype.onEnd = function () {
  this.log('</testsuites>');
  base.onSuiteEnd.call(this);
};

/**
 * Executed when a test suite is started
 *
 * @param {string} test - User agent
 * @param {string} agent - User agent
 */
JUnitReporter.prototype.onFileStart = function (test, agent) {
  base.onFileStart.call(this, test, agent);
  this.log(
    '<testsuite ',
    'name="', test.path, '" ',
    'failures="', test.results.done.failed, '" ',
    'tests="', test.results.done.total, '" ',
    'time="', test.results.done.runtime, '"',
    '>'
   );
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
JUnitReporter.prototype.onTestStart = function (testName) {
  base.onTestStart.call(this, testName);
};

/**
 * To be executed when a test ends
 *
 * @param {object} results - Test results
 */
JUnitReporter.prototype.onTestEnd = function (results) {
  base.onTestEnd.call(this, results);
  var passed = (results.status === 'PASSED');

  this.log(
    '<testcase ',
    'classname="', results.name, '" ',
    'name=" >> ', results.message, '" ',
    'result="', (passed) ? 'pass' : 'fail', '" ',
    'message="', results.message, '"',
    (passed) ? '/>' : '>'
  );

  if (!passed) {
    this.log('<failure>');
    this.log(results.stackTrace);
    this.log('</failure>');
    this.log('</testcase>');
  }

};

/**
 * To be executed when a test passes
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 */
JUnitReporter.prototype.onPass = function (name, message) {
  base.onPass.call(this, name);
  // this.log('<testcase name="' + name + '"/>');
};

/**
 * To be executed when a test fails
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
JUnitReporter.prototype.onFail = function (name, message, stackTrace) {
  base.onFail.call(this, name, message, stackTrace);
  // this.log('<testcase name="' + name + '">');
  // this.log('<failure message="' + message + '">');

  // if (stackTrace) {
    // this.log(stackTrace);
  // }

  // this.log('</failure>');
  // this.log('</testcase>');

  // console.log('\r     x'.red + ' ' + message.red);

  // if (stackTrace) {
    // console.log('\r   ' + stackTrace);
  // }

  // console.log('\r');
};

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
JUnitReporter.prototype.onFileEnd = function (runtime) {

  this.log('</testsuite>');

  base.onFileEnd.call(this, runtime);
  // if (this.failed === 0) {
    // var content = this.passed === 1 ? ' test completed' : ' tests completed',
    // message = '\n✓' + ' ' + this.passed.toString() + content + ' (' +
        // runtime.toString()  + 'ms)';

    // console.log(message.green);
  // } else {
    // var content = this.failed === 1 ? ' test failed' : ' tests failed',
    // message = '\nx' + ' ' + this.failed.toString() + ' of ' +
        // this.total.toString() + content + ' (' + runtime.toString()  + 'ms)';

    // console.log(message.red);
  // }

  // console.log('\r');

};

module.exports = JUnitReporter;
