var path = require('path');

module.exports = {
  lib: function (libPath) {
    return require(path.resolve(__dirname, '..', '..', 'lib', libPath));
  },

  path: function () {
    var args = Array.prototype.slice.call(arguments, 0);

    args.unshift(__dirname, '..');

    return path.resolve.apply(path, args);
  }
};
