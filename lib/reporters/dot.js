var util = require('util'),
    Base = require('./base').Base,
    base = new Base();

/**
 * Tests reporter
 */
var Dot = function() {
  Base.call(this);
};

// We want to listen for events
util.inherits(Dot, Base);

/**
 * Prints a green dot
 *
 * @param {string} message - Test message
 */
Dot.prototype.onPass = function(message) {
  base.onPass.call(this, message);

  process.stdout.write('.'.green);
};

/**
 * Prints a red F
 *
 * @param {string} message - Test message
 */
Dot.prototype.onFail = function(message, stackTrace) {
  base.onFail.call(this, message, stackTrace);

  process.stdout.write('F'.red);
};

/**
 * Prints all failures
 */
Dot.prototype.onSuiteEnd = function() {
  var i;

  for (i in this.failures) {
    console.log('\n');
    console.log(this.failures[i].message.red);
    console.log(this.failures[i].stackTrace);
  }

  base.onSuiteEnd.call(this);
};

module.exports.Dot = Dot;
