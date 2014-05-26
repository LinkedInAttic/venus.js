var expect  = require('expect.js'),
    helpers = require('../../helpers'),
    load    = helpers.lib('configLoader');

describe('configLoader', function () {
  var config;

  describe('default config only', function () {
    before(function () {
      config = load(
        null,
        process.cwd(),
        helpers.path('fixtures', '.venusrc', 'default-mock'));
    });

    it('config should have 1 plugin', function () {
      expect(config.plugins[0]).to.be('venus-plugin');
    });
  });

  describe('custom config, with default name', function () {
    before(function () {
      config = load(
        null,
        helpers.path('fixtures', '.venusrc'),
        helpers.path('fixtures', '.venusrc', 'default-mock', 'mock'));
    });

    it('config should have 2 keys', function () {
      expect(config.plugins.length).to.be(2);
    });

  });

});
