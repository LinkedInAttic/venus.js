var EventEmitter = require('events').EventEmitter,
    util         = require('util'),
    log          = require('./lib/log');

module.exports = Venus;

function Venus(config) {
  this.config     = config;
  this.testFiles  = {};
  this.transforms = {};
  this.globals    = {};
  this.plugins    = {};
  this.events     = require('./lib/events');
};

util.inherits(Venus, EventEmitter);

/**
 * @method start
 */
Venus.prototype.start = function () {
  var coreLog = log('venus-core', this.config.colors);

  // instantiate plugins
  this.config.plugins.forEach(function (plugin) {
    try {
      this.plugins[plugin] = new (require(plugin))(this, log(plugin, this.config.colors));
      coreLog('Loaded plugin', coreLog.yellow(plugin));
    } catch (e) {
      coreLog('Failed to load plugin', coreLog.red(plugin));
    }
  }, this);

  this.emit(this.events.VC_START);
  // this.exit(127);
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


