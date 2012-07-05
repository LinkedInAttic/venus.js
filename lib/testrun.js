'use strict';
/**
 * Keeps track of a test run
 * @author LinkedIn
 */
var fs = require('fs'),
    comments = require('./util/commentsParser');

/**
 * Represents a single test run - comprised of 1 or more TestRuns
 */
function TestRun() {}

/**
 * Initialize
 */
TestRun.prototype.init = function(tests) {
  this.tests = tests || {};
  this.defineProperties();
}

/**
 * Define properties
 */
TestRun.prototype.defineProperties = function() {

  Object.defineProperties(this, {

    /**
     * Get the number of tests in this run group
     */
    'testCount': {
      get: function() {
        return Object.keys(this.tests).length;
      }
    },

    /**
     * Get the tests as an array
     */
    'testArray': {
      get: function() {
        return Object.keys(this.tests).map(function(key) {
          return this.tests[key];
        }, this);
      }
    },

    /**
     * Return test URLs
     */
    'urls': {
      get: function() {
        return this.testArray.map(function(test) {
          return test.url;
        });
      }
    }

  });

}

/**
 * Create a new TestRun object
 * @param {Array} tests the testcases
 */
function create(tests) {
  var instance = new TestRun();
  instance.init(tests);
  return instance;
}

module.exports.TestRun = TestRun;
module.exports.create = create;
Object.seal(module.exports);
