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

  this.suiteReports = [];
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
 * Sanitize output
 * @param {string} str - string to sanitize
 */
JUnitReporter.prototype.clean = function (str) {
  return str.replace(/"/g, '\'');
};

/**
 * Executed at the end of a test run
 * @param {string} testgroup - Group of tests which will run
 * @param {number} duration - time of test run, in ms
 */
JUnitReporter.prototype.onEnd = function (testgroup, duration) {
  this.log('</testsuites>');

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

  this.suiteReports.push(
    new JUnitSuiteReport(this, test.path)
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

  // Get active suite report (last in list)
  var report = this.suiteReports[this.suiteReports.length - 1];
  report.logTestResults(results);

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
  this.suiteReports.forEach(function (report) {
    this.log(report.toString());
  }, this);

  console.log('\r');
  base.onFileEnd.call(this, runtime);
};


/**
 * Reports on a single suite
 */
function JUnitSuiteReport(reporter, path) {
  this.reporter = reporter;
  this.path = path;
  this.testCaseResults = [];
}

/**
 * Log the result of an individual test case
 *
 * @param {Object} results - Test results
 */
JUnitSuiteReport.prototype.logTestResults = function (results) {
  this.testCaseResults.push(results);
};

/**
 * Output the suite as an XML string for logging
 */
JUnitSuiteReport.prototype.toString = function () {
  var reporter = this.reporter;
  var clean = reporter.clean;

  var out = [['  <testsuite ',
    'name="', reporter.clean(this.path), '" ',
    'failures="', reporter.failed, '" ',
    'tests="', reporter.total, '" ',
    'time="', reporter.runtime, '"',
    '>'].join('')];

  out = out.concat(this.testCaseResults.map(function (results) {
    var passed = (results.status === 'PASSED');
    return ['    <testcase ',
        'name=" >> ', clean(results.name), ' >> ', clean(results.message), '" ',
        'classname="', results.file.replace(/\./g, '-'), '" ',
        'result="', passed ? 'pass' : 'fail', '" ',
        'message="', clean(results.message), '"',
        passed ? '/>' : '>'].join('');
  }));

  out.push('</testsuite>');
  return out.join('\n');
};

module.exports = JUnitReporter;
