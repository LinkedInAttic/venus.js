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
    _s           = require('underscore.string'),
    BaseReporter = require('./BaseReporter'),
    base         = new BaseReporter();

/**
 * Returns the path relative to current process.
 */
function getRelativePath(filepath) {
  try {
    var cwd = process.cwd();
    if (filepath.indexOf(cwd) == 0) {
      return filepath.substr(cwd.length + 1);
    } else {
      return filepath;
    }
  } catch (e) {
    // For any error, just return the original path
    return filepath;
  }
}


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
};

/**
 * Sanitize output
 * @param {string} str - string to sanitize
 */
JUnitReporter.prototype.clean = function (str) {
  return _s.escapeHTML(str.replace(/"/g, '\''));
};

/**
 * Executed at the end of a test run
 * @param {string} testgroup - Group of tests which will run
 * @param {number} duration - time of test run, in ms
 */
JUnitReporter.prototype.onEnd = function (testgroup, duration) {
  this.log('</testsuites>');
  this.logFront(
    '<testsuites ',
    'failures="', this.failed, '" ',
    'errors="', this.errored, '" ',
    'tests="', this.total, '" ',
    'time="', duration/1000 || 0, '" ',
    '>'
  );
  this.logFront('<?xml version="1.0" encoding="UTF-8"?>');

  console.log('\n--------------------------------------------------------');
  console.log(' ', this.total, 'tests executed in', duration, 'ms');
  console.log(('  ' + this.passed + ' ✓ passes').green);
  console.log(('  ' + this.failed + ' x failures').red);
  console.log(('  ' + this.errored + ' x errors').red);
  console.log('');

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
    'name="', this.clean(getRelativePath(test.path)), '" ',
    'failures="', test.results.done.failed, '" ',
    'tests="', test.results.done.total || test.results.tests.length, '" ',
    'time="', test.results.done.runtime || 0, '"',
    '>'
   );

  console.log('\n', agent, test.path);
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
    'name=" >> ', this.clean(results.name), ' >> ', this.clean(results.message), '" ',
    'classname="', this.clean(getRelativePath(results.file).replace(/\./g, '-')), '" ',
    'result="', (passed) ? 'pass' : 'fail', '" ',
    'message="', this.clean(results.message), '"',
    (passed) ? '/>' : '>'
  );

  if (!passed) {
    this.log('<failure>');
    this.log(results.stackTrace);
    this.log('</failure>');
    this.log('</testcase>');
  }

  if(this.lastName !== results.name) {
    console.log('');
    console.log('  ', results.name);
    console.log('   --------------------------------------------------------');
    this.lastName = results.name;
  }

  if (passed) {
    console.log('   ✓' + ' ' + results.message);
  } else {
    console.log('   x' + ' ' + results.message);

    if (results.stackTrace) {
      console.log('     ' + results.stackTrace.replace(/\n/g, '\n   '));
    }
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
};

/**
 * Executed when a test suite finishes
 *
 * @param {int} runtime - Number of miliseconds the suite took to run
 */
JUnitReporter.prototype.onFileEnd = function (runtime) {

  this.log('</testsuite>');
  console.log('\r');
  base.onFileEnd.call(this, runtime);
};

module.exports = JUnitReporter;
