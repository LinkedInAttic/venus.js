/**
 * @author LinkedIn
 */
'use strict';
var should        = require('../lib/sinon-chai').chai.should(),
    config        = require('../../lib/config'),
    testHelper    = require('../lib/helpers'),
    fs            = require('fs');

describe('lib/config', function() {

  describe('searchforfile', function() {
    it('should find specified file', function() {
      var matches = config
        .instance()
        .searchForFile('.venus/', testHelper.fakeCwd());

      matches.length.should.be.above(2);
    });
  });

  describe('getSearchPath', function() {
    it('should find search paths', function() {
      var conf = new config.Config();
      conf.cwd = testHelper.fakeCwd();
      conf.getSearchPath().length.should.be.above(2);
    });
  });

  describe('findConfigs', function() {
    it('should find the configs in search path', function() {
      var conf = new config.Config();
      conf.cwd = testHelper.fakeCwd();
      conf.findConfigs().length.should.be.above(2);
    });
  });

  describe('buildLookupChain', function() {
    it('should return config objects', function() {
      var conf = new config.Config(),
          chain;

      conf.cwd = testHelper.fakeCwd();
      chain = conf.buildLookupChain().configs;
      chain.length.should.be.above(0);
      chain[0].libraries.mocha.should.eql('mocha.js');
    });
  });

  describe('get', function() {
    var conf = new config.Config(testHelper.fakeCwd());

    it('should get the closest value for a property', function() {
      conf.get('libraries.jasmine').should.eql('jasmine.js');
    });
  });

  describe('loadFile', function() {
    it('should load a file in a config directory', function() {
      var conf = new config.Config(testHelper.fakeCwd());
      conf.loadFile('templates/test.tl').should.eql('ship ahoy!\n');
    });
  });

  describe('loadTemplate', function() {
    it('should load a template', function() {
      var conf = new config.Config(testHelper.fakeCwd());
      conf.loadTemplate('test').should.eql('ship ahoy!\n');
    });
  });
});
