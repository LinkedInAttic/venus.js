/**
 * Create a new Venus app context object
 * @param {Venus} venus app context
 */
module.exports = function (venus) {
  var newCtx = {};

  Object.keys(venus).forEach(function (key) {
    newCtx[key] = venus[key];
  });

  newCtx.on   = venus.on;
  newCtx.emit = venus.emit;

  return newCtx;
};
