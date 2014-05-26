
var assert = require('assert');

// add additional assertions
assert.endsWith = function (actual, expected) {
  var len   = expected.length;
  var slice = actual.slice(-len);

  return assert.equal(slice, expected);
};

module.exports = assert;
