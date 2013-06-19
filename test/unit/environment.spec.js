/**
 * @author LinkedIn
 */
'use strict';
var environment   = require('../../lib/environment'),
    sinon         = require('sinon'),
    path          = require('flavored-path'),
    expect        = require('expect.js'),
    phantomUac    = require('../../lib/uac/phantom'),
    _s            = require('underscore.string'),
    helpers       = require('../lib/helpers.js');

describe('lib/environment', function () {
  var env;

  beforeEach(function () {
    env = new environment.Environment(helpers.testConfig());
  });

  describe('loading the environment config', function () {
    var envConfig;

    beforeEach(function () {
      envConfig = env.loadConfig('phantomjs');
    });

    it('should load the UAC properly', function () {
      expect(env.uac).to.be(phantomUac);
    });

    it('should provide absolute paths', function () {
      expect(path.isAbsolute(envConfig.binaryPath[0])).to.be(true);
    });

  });
});
