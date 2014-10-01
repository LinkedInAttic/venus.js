'use strict';

var Config  = require('./Config');
var Plugins = require('./Plugins');
var str     = require('./util/str');

module.exports = Kernel;

/**
 * Venus' core object which orchestrates all other activity.
 * @constructor
 * @param {object} argv - key/value hash.
 */
function Kernel(argv) {
  this.config  = new Config(argv);
  this.plugins = new Plugins(this);
}

/**
 * Run the application
 */
Kernel.prototype.run = function () {
  var config = this.config.ctx();

  this.plugins.instantiate();

  if (config.get('h') || config.get('help')) {
    this.usage();
  } else {
    this.plugins.init()
      .then(this.plugins.attach)
      .then(this.plugins.run)
      .then(this.plugins.exit)
      .then(null, this.error);
  }
};

/**
 * Handle error
 * @param {Error} err
 */
Kernel.prototype.error = function (err) {
  console.error(err.stack);
  process.exit(1);
};

/**
 * Show help
 */
Kernel.prototype.usage = function () {
  var args = [
    {
      switches: ['-h', '--help'],
      description: 'show help'
    },
    {
      switches: ['--disable-colors'],
      description: 'disable colors in output logs'
    }
  ];


  console.log('Usage: venus [command] [arguments]\n');
  console.log('Options:');

  args.forEach(function (arg) {
    console.log(str.fmt(arg.switches.join(', '), 2, 30), arg.description);
  });
};
