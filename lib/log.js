var clc = require('cli-color');

module.exports = function (name, useColors, enabled) {
  var log, colorLog;

  log = function () {
    if (!enabled) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(log.green(name), '>>');
    console.log.apply(console, args);
  };

  colorLog = function (color) {
    return function (text) {
      if (useColors !== 'false' && color in clc) {
        return clc[color](text);
      }

      return text;
    }
  };

  ['red', 'green', 'blue', 'yellow'].forEach(function (color) {
    log[color] = colorLog(color);
  });

  return log;
};

