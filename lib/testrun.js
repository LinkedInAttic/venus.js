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

// Constructor for TestRun  
function TestRun() {};

// Initialize  
TestRun.prototype.init = function(tests) {
  this.tests = tests || {};
  this.defineProperties();
};

// Define properties  
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
    }

  });

};

// Create a new TestRun object  
function create(tests) {
  var instance = new TestRun();
  instance.init(tests);
  return instance;
};

module.exports.TestRun = TestRun;
module.exports.create = create;
Object.seal(module.exports);
