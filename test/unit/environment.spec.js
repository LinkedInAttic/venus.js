/**
 * @author LinkedIn
 */
'use strict';
var environment    = require('../../lib/environment'),
    sinon          = require('sinon'),
    path           = require('flavored-path'),
    expect         = require('expect.js'),
    GhostDriverUac = require('../../lib/uac/GhostDriverUac'),
    _s             = require('underscore.string'),
    helpers        = require('../lib/helpers.js');

describe('lib/environment', function () {
  var env;

  beforeEach(function () {
    env = new environment.Environment(helpers.testConfig());
  });

  describe('loading the environment config', function () {
    var envConfig;

    beforeEach(function () {
      envConfig = env.loadConfig('ghost');
    });

    it('should load the UAC properly', function () {
      expect(env.Uac).to.be(GhostDriverUac);
    });

    it('should provide absolute paths', function () {
      expect(path.isAbsolute(envConfig.binaryPath[0])).to.be(true);
    });

  });
});
