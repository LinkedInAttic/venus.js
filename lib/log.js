var clc = require('cli-color');

module.exports = function (name, useColors) {
  var log, colorLog;

  log = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(log.green(name), '  \t');
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

