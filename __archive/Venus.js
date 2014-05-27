var EventEmitter  = require('events').EventEmitter,
    util          = require('util'),
    q             = require('q'),
    log           = require('./lib/log'),
    PluginManager = require('./lib/PluginManager');

module.exports = Venus;

function Venus(config) {
  this.config       = config;
  this.testFiles    = {};
  this.transforms   = {};
  this.globals      = {};
  this.plugins      = new PluginManager();
  this.events       = require('./lib/events');
  this.eventEmitter = new EventEmitter();

  // Defaults
  this.config.info = (typeof this.config.info === 'undefined' ? true : this.config.info);

  this.info       = log('venus-core', this.config.colors, this.config.info);
  this.debug      = log('venus-core', this.config.colors, this.config.debug);
};

/**
 * @method start
 */
Venus.prototype.start = function () {
  var plugins = this.plugins;

  q.all(plugins.load(this))
    .then(function () {
      return q.all(plugins.init());
    })
    .then(function () {
      plugins.run();
   });
};

/**
 * @method exit
 * @param {int} code exit code
 */
Venus.prototype.exit = function (code) {
  var abort = false;

  this.emit(this.events.VC_EXIT, code, function () {
    abort = true;
  });

  if (!abort) {
    process.exit(code);
  } else {
    console.log('SHUTDOWN ABORTED');
  }
};

/**
 * @method on
 */
Venus.prototype.on = function () {
  this.eventEmitter.on.apply(this.eventEmitter, arguments);
};

/**
 * @method emit
 */
Venus.prototype.emit = function () {
  this.eventEmitter.emit.apply(this.eventEmitter, arguments);
};
