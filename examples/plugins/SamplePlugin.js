module.exports = function (venus) {
  venus.on(venus.events.VC_START, function () {
    console.log('Sample Plugin: Venus is starting', venus.config.samplePlugin, venus);
  });

  venus.on(venus.events.VC_EXIT, function (code, abort) {
    console.log('Sample Plugin: Venus is exiting with code', code);
    abort();
  });
};
