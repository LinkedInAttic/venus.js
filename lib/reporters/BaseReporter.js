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
var events = require('events'),
    util   = require('util'),
    fs     = require('fs');

/**
 * Tests reporter
 */
function BaseReporter(outputFile) {
  this.outputFile = outputFile;
  this.failures = [];
  this.errors = [];
  this.resetCounters();
  this.init();
  this.output = [];
}

// We want to listen for events
util.inherits(BaseReporter, events.EventEmitter);

/**
 * Bind all event listeners
 */
BaseReporter.prototype.init = function () {
  this.on('start', this.onStart);
  this.on('suite', this.onSuite);
  this.on('test-start', this.onTestStart);
  this.on('test-end', this.onTestEnd);
  this.on('file-start', this.onFileStart);
  this.on('file-end', this.onFileEnd);
  this.on('pass', this.onPass);
  this.on('fail', this.onFail);
  this.on('error', this.onError);
  this.on('end', this.onEnd);

};

/**
 * Log output
 */
BaseReporter.prototype.log = function () {
  var str = Array.prototype.slice.call(arguments).join('');
  this.output.push(str);
};

/**
 * Executed when a test suite is started
 */
BaseReporter.prototype.onSuite = function () {};

/**
 * Executed when a test file starts running
 *
 * @param {string} test - the test object
 * @param {string} agent - User agent
 */
BaseReporter.prototype.onFileStart = function (test, agent) {};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
BaseReporter.prototype.onTestStart = function (testName) {
  this.total++;
};

/**
 * To be executed when a test passes
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 */
BaseReporter.prototype.onPass = function (name, message) {
  this.passed++;
};

/**
 * To be executed when a test fails
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
BaseReporter.prototype.onFail = function (name, message, stackTrace) {
  this.failed++;

  this.failures.push({
    name: name,
    message: message,
    stackTrace: stackTrace
  });
};

/**
 * To be executed when a test has an error which prevents it from running
 *
 * @param {string} name - Test name
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
BaseReporter.prototype.onError = function (name, message, stackTrace) {
  this.errored++;

  this.errors.push({
    name: name,
    message: message,
    stackTrace: stackTrace
  });
};

/**
 * To be executed when a test is finished
 */
BaseReporter.prototype.onTestEnd = function () {};

/**
 * Executed when a test file execution finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
BaseReporter.prototype.onFileEnd = function (runtime) {
  this.failures = [];
  // this.resetCounters();
};


/**
 * Executed when a test suite finishes
 */
BaseReporter.prototype.onSuiteEnd = function () {
  if (!this.outputFile) {
    return;
  }

  fs.writeFileSync(this.outputFile, this.output.join('\n'));

};

/**
 * Executed when a test run starts
 * @param {string} testgroup - Group of tests which will run
 */
BaseReporter.prototype.onStart = function (testgroup) {};

/**
 * Executed when a test run ends
 * @param {string} testgroup - Group of tests which will run
 */
BaseReporter.prototype.onEnd = function (testgroup) {};

/**
 * Reset test counters
 */
BaseReporter.prototype.resetCounters = function () {
  this.total = 0;
  this.passed = 0;
  this.failed = 0;
  this.errored = 0;
};

module.exports = BaseReporter;
