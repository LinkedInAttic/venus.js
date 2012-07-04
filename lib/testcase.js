'use strict';
/**
 * Parses a testcase (or spec)
 * @author LinkedIn
 */
var fs = require('fs'),
    comments = require('./util/commentsParser');

/**
 * Represents a single testcase file
 */
function TestCase() {}

/**
 * Initialize
 */
TestCase.prototype.init = function(path, id) {
  var result  = parseTestFile(path);
  this.data   = result.data;
  this.config = result.config;
  this.id     = id;
}

/**
 * Parse a test case file
 */
function parseTestFile(file) {
  var result = {
    path: file
  };

  result.data = fs.readFileSync(file).toString();
  result.config = comments.parseStr(result.data);
  return result;
}

/**
 * Create a new TestCase object
 * @param {String} path the absolute path to testcase file
 * @param {String} id the test id
 */
function create(path, id) {
  var instance = new TestCase();
  instance.init(path, id);
  return instance;
}

module.exports.TestCase = TestCase;
module.exports.create = create;
Object.seal(module.exports);
