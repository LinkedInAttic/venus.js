/**
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
 */

/**
 * Create a Mocha adaptor which inherits methods from the adapter template (.venus/adapters/adaptor-template.js)
 */

/**
 * Setup Mocha with behavior driven development (BDD)
 */
function Adaptor() {
  mocha.setup({ ui: 'bdd', ignoreLeaks: true });
};

// Inherit from adapter template
Adaptor.prototype = new AdaptorTemplate();

/**
 * ### start
 * Start and process test results
 * @method start
 * @return {Void}
 */
Adaptor.prototype.start = function() {
  var self, fixtureHelper, mochaDiv, runner, tests, complete;

  tests = [];
  self = this,
  fixtureHelper = (typeof FixtureHelper === 'function') ? new FixtureHelper() : false,

  // Create div for mocha results. Mocha complains if this is not present.
  mochaDiv = document.createElement('div');
  mochaDiv.id = 'mocha';
  mochaDiv.style['display'] = 'none';
  document.body.appendChild(mochaDiv);

  runner = mocha.run();
  runner.globals(['__flash_getWindowLocation', '__flash_getTopLocation']);

  // A single unit test is done
  runner.on('test end', function (data) {
    if (!data.state || data.pending || tests.indexOf(data) !== -1) {
      return;
    }

    tests.push(data);

    if (fixtureHelper) {
      fixtureHelper.restoreState();
    }
    self.addTestResult(data);
  });

  // All unit tests are done
  runner.on('end', function () {
    if (complete) {
      return;
    }

    complete = true;
    self.processFinalResults(this);
    self.sendResults();
  });

  runner.run();
};

/**
 * ### getTestMessage
 * Get message from test result
 * @method getTestMessage
 * @param {Object} data test result data
 * @return {String} test result message
 */
Adaptor.prototype.getTestMessage = function(data) {
  return data.title ? data.title : '';
};

/**
 * ### getTestName
 * Get name from test result
 * @method getTestName
 * @param {Object} data test result data
 * @return {String} test result name
 */
Adaptor.prototype.getTestName = function(data) {
  var obj = null,
      title = '',
      testName = '';

  // Make sure to obtain the proper test name if it is nested within other tests
  var obj = data;
  while (obj.hasOwnProperty('parent')) {
    title = obj.parent.title;
    if (title) {
      !testName ? testName = title : testName = title.concat(' >> ' + testName);
    }
    obj = obj.parent;
  };

  return testName;
};

/**
 * ### getTestStatus
 * Get status from test result
 * @method getTestStatus
 * @param {Object} data test result data
 * @return {Boolean} test result status
 */
AdaptorTemplate.prototype.getTestStatus = function(data) {
  return data.state === 'passed' ? this.ENUM_STATE.PASSED : this.ENUM_STATE.FAILED;
};

/**
 * ### getTestStackTrace
 * Get stack trace from test result
 * @method getTestStackTrace
 * @param {Object} data test result data
 * @return {String} test result stack trace
 */
AdaptorTemplate.prototype.getTestStackTrace = function(data) {
  return data.hasOwnProperty('err') ? data.err.stack : '';
};

/**
 * ### getTotal
 * Get total number of tests
 * @method getTotal
 * @param {Object} data test result data
 * @return {Integer} total number of tests
 */
AdaptorTemplate.prototype.getTotal = function(data) {
  return data.passes + data.failures;
};

/**
 * ### getTotalFailed
 * Get total number of failed tests
 * @method getTotalFailed
 * @param {Object} data test result data
 * @return {Integer} total number of failed tests
 */
AdaptorTemplate.prototype.getTotalFailed = function(data) {
  return data.failures;
};

/**
 * ### getTotalPassed
 * Get total number of passed tests
 * @method getTotalPassed
 * @param {Object} data test result data
 * @return {Integer} total number of passed tests
 */
AdaptorTemplate.prototype.getTotalPassed = function(data) {
  return data.passes;
};

/**
 * ### getTotalRuntime
 * Get total runtime of running all tests
 * @method getTotalRuntime
 * @param {Object} data test result data
 * @return {Integer} total runtime
 */
AdaptorTemplate.prototype.getTotalRuntime = function(data) {
  return data.milliseconds;
};

// Provide Array.indexOf for IE7/8
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    'use strict';
    if (this == null) {
      throw new TypeError();
    }
    var n, k, t = Object(this),
        len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }
    n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}
