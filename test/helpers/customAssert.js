
var assert = require('assert');

// add additional assertions
assert.endsWith = function (actual, expected) {
  var len   = expected.length;
  var slice = actual.slice(-len);

  return assert.equal(slice, expected);
};

assert.true = function (actual) {
  return assert.equal(actual, true);
};

assert.false = function (actual) {
  return assert.equal(actual, false);
};

module.exports = assert;
