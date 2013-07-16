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
function TAPReporter(outputFile) {
  BaseReporter.call(this, outputFile);
}

// We want to listen for events
util.inherits(TAPReporter, BaseReporter);

/**
 * Executed at the beginning of a test run
 */
TAPReporter.prototype.onStart = function () {
  base.onSuite.call(this);
};

/**
 * Executed at the end of a test run
 */
TAPReporter.prototype.onEnd = function () {
  base.onSuiteEnd.call(this);
};

/**
 * Executed when a test suite is started
 *
 * @param {string} test - User agent
 * @param {string} agent - User agent
 */
TAPReporter.prototype.onFileStart = function (test, agent) {
  base.onFileStart.call(this, test, agent);
  this.log(
    '1..', test.results.done.total
   );
};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
TAPReporter.prototype.onTestStart = function (testName) {
  base.onTestStart.call(this, testName);
};

/**
 * To be executed when a test ends
 *
 * @param {object} results - Test results
 */
TAPReporter.prototype.onTestEnd = function (results) {
  base.onTestEnd.call(this, results);
  var passed = (results.status === 'PASSED');
  var okMessage = 'ok '
  if (!passed) {
    okMessage = 'not ' + okMessage;
  }

  this.log(
    okMessage, this.total, ' ',
    results.name, ' - ', results.message
  );
};

/**
 * To be executed when a test passes
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 */
TAPReporter.prototype.onPass = function (name, message) {
  base.onPass.call(this, name);
 };

/**
 * To be executed when a test fails
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
TAPReporter.prototype.onFail = function (name, message, stackTrace) {
  base.onFail.call(this, name, message, stackTrace);
 };

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
TAPReporter.prototype.onFileEnd = function (runtime) {

   base.onFileEnd.call(this, runtime);
 
};

module.exports = TAPReporter;
