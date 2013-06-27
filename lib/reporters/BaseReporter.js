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
    util   = require('util');

/**
 * Tests reporter
 */
function BaseReporter() {
  this.failures = [];
  this.resetCounters();
  this.init();
}

// We want to listen for events
util.inherits(BaseReporter, events.EventEmitter);

/**
 * Bind all event listeners
 */
BaseReporter.prototype.init = function () {
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
BaseReporter.prototype.onSuite = function () {};

/**
 * Executed when a test file starts running
 *
 * @param {string} agent - User agent
 */
BaseReporter.prototype.onFile = function (agent) {};

/**
 * To be executed when a test is started
 *
 * @param {string} testName - Name of the test that is being executed
 */
BaseReporter.prototype.onStart = function (testName) {
  this.total++;
};

/**
 * To be executed when a test passes
 *
 * @param {string} message - Test message
 */
BaseReporter.prototype.onPass = function (message) {
  this.passed++;
};

/**
 * To be executed when a test fails
 *
 * @param {string} message - Test message
 * @param {string} stackTrace - Stack trace for the error
 */
BaseReporter.prototype.onFail = function (message, stackTrace) {
  this.failed++;

  this.failures.push({
    message: message,
    stackTrace: stackTrace
  });
};

/**
 * To be executed when a test is finished
 */
BaseReporter.prototype.onEnd = function () {};

/**
 * Executed when a test file execution finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
BaseReporter.prototype.onFileEnd = function (runtime) {
  this.failures = [];
  this.resetCounters();
};


/**
 * Executed when a test suite finishes
 */
BaseReporter.prototype.onSuiteEnd = function() {};

/**
 * Reset test counters
 */
BaseReporter.prototype.resetCounters = function() {
  this.total = 0;
  this.passed = 0;
  this.failed = 0;
};

module.exports = BaseReporter;
