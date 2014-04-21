var q = require('q');

module.exports = AsyncLoad;

function AsyncLoad(venus) {}

AsyncLoad.prototype.load = function () {
  var def = q.defer();

  setTimeout(function () {
    def.resolve();
  }, 1000);

  return def.promise;
};
