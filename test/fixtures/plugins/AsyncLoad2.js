var q = require('q');

module.exports = AsyncLoad2

function AsyncLoad2(venus) {}

AsyncLoad2.prototype.load = function () {
  var def = q.defer();

  setTimeout(function () {
    def.resolve();
  }, 200);

  return def.promise;
};
