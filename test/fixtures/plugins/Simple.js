module.exports = Simple;

function Simple(venus) {}

Simple.prototype.name = 'SimplePlugin';

Simple.prototype.alert = function () {
  return 'hello. goodbye';
};
