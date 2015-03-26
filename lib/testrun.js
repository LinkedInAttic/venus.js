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

// Keeps track of a test run for Venus application

'use strict';
var fs       = require('fs'),
    comments = require('./util/commentsParser');

/**
 * Constructor
 * @constructor
 */
function TestRun() {};

/**
 * Initializes a TestRun instance
 * @param  {Object}    tests object containing testcase objects as properties where the key is equal to the test's id
 * @return {Undefined} Undefiend
 */
TestRun.prototype.init = function(tests) {
  this.tests = tests || {};
  this.defineProperties();
};

/**
 * Adds code coverage results to a TestCase's 'rawCoverageData' property
 * @param {Number} testId the testId to add results to
 * @param {Object} data   code coverage data to add
 */
TestRun.prototype.addCodeCoverageResults = function (testId, data) {
  var test = this.getTestById(testId);

  if (test && data) {
    test.rawCoverageData = data;
    return true;
  }

  return false;
};

/**
 * Defines properties (getters)
 * @return {Undefiend} Undefined
 */
TestRun.prototype.defineProperties = function() {

  Object.defineProperties(this, {

    // Get the number of tests in this run group
    'testCount': {
      get: function() {
        return Object.keys(this.tests).length;
      }
    },

    // Get the tests as an array
    'testArray': {
      get: function() {
        return Object.keys(this.tests).map(function(key) {
          return this.tests[key];
        }, this);
      }
    },

    // Return test URLs
    'urls': {
      get: function() {
        return this.testArray.map(function(test) {
          return test.url;
        });
      }
    },

    // Code coverage data array
    'rawCodeCoverageData': {
      get: function () {
        return this.testArray.map(function (test) {
          return test.rawCoverageData;
        }).filter(function (data) {
          return data !== undefined;
        });
      }
    }

  });

};

/**
 * Retreives a test for a given id
 * @param  {Number}             id the test id
 * @return {Undefined|TestCase} the matching test case. Undefined if no match is found.
 */
TestRun.prototype.getTestById = function (id) {
  var match;

  this.testArray.some(function (test) {
    if (test.id === id) {
      match = test;
      return true;
    }
  });

  return match;
};

/**
 * Create a TestRun object
 * @param  {Object}  tests an object containing test objects
 * @return {TestRun}       a new TestRun instance
 */
function create(tests) {
  var instance = new TestRun();
  instance.init(tests);
  return instance;
};

module.exports.TestRun = TestRun;
module.exports.create = create;
Object.seal(module.exports);
