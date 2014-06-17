module.exports.before = function () {
  return 'before hook';
};

module.exports.transform = function (ctx, target) {
  return 'transform hook';
}
