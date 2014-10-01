'use strict';

var clc = require('cli-color');

module.exports = {
  info: function (name, colorize) {
    var colorFn = this.noop;

    if (colorize) {
      colorFn = clc.green;
    }

    return this.log('info', name, colorFn);
  },

  debug: function (name, colorize) {
    var colorFn = this.noop;

    if (colorize) {
      colorFn = clc.cyan;
    }

    return this.log('debug', name, colorFn);
  },

  error: function (name, colorize) {
    var colorFn = this.noop;

    if (colorize) {
      colorFn = clc.red.bold;
    }

    return this.log('error', name, colorFn);
  },

  log: function (level, name, color) {
    return function () {
      var args   = Array.prototype.slice.call(arguments, 0);
      var prefix = color(name) + '::' + color(level);

      args.unshift(prefix);
      args.push('(' + this.codeLoc() + ')');
      console.log.apply(console, args);
    }.bind(this);
  },

  codeLoc: function () {
    var stack = new Error().stack;

    stack = stack.split('\n')[3];
    stack = stack.match(/([a-zA-Z0-9.]*:[0-9]*:[0-9]*)\)/)[1];

    return stack;
  },

  noop: function (arg) {
    return arg;
  }
};
