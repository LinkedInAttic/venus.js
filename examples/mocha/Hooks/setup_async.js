module.exports.before = function (ctx) {
  var when, def;

  try {
    when = require('when');
  } catch (e) {
    console.log('Run `npm install -g when` before running this example');
    return;
  }

  def  = when.defer();

  setTimeout(function () {
    console.log('before hook: 5 seconds later...');
    console.log('before hook ctx:', ctx);
    def.resolve();
  }, 5000);

  return def.promise;
};
