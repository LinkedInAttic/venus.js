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
      var conf = new config.Config(testHelper.fakeCwd()),
          chain;

      chain = conf.buildLookupChain().configs;
      chain.length.should.be.above(0);
      chain[0].data.libraries.mocha.includes[0].should.eql('libraries/mocha.js');
    });
  });

  describe('get', function() {
    var conf = new config.Config(testHelper.fakeCwd());

    it('should get the closest value for a property', function() {
      conf.get('libraries.jasmine.library.includes').value[0].should.eql('libraries/jasmine.js');
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

  describe('resolve', function() {
    it('should work with a property that is a string', function() {
      var conf = new config.Config(testHelper.fakeCwd()),
          includes = conf.resolve('libraries.mocha.library');

    });

    it('should work with a property that is an array', function() {
      var conf = new config.Config(testHelper.fakeCwd()),
          includes = conf.resolve('includes');

    });
  });

  describe('routes', function() {
    it('should return a string for an existing route', function() {
      // The 'path-to-lorem-ipsum.txt' route defined in
      // test/data/sample_fs/projects/.venus/config should match
      // the absolute path to that file.
      var conf = new config.Config(testHelper.fakeCwd()),
          routes = conf.get('routes'),
          resolvedRoute;
      should.exist(routes);
      should.exist(routes.value);
      resolvedRoute = routes.value['path-to-lorem-ipsum.txt'];
      resolvedRoute.should.be.a('string');
      resolvedRoute.should.eql(
        testHelper.fakeCwd() + '/.venus/includes/lorem_ipsum.txt');
    });

    it('should return undefined for a non-existent route', function() {
      // Non-existent routes should have a undefined value.
      var conf = new config.Config(testHelper.fakeCwd()),
          routes = conf.get('routes');
      should.exist(routes);
      should.exist(routes.value);
      should.not.exist(routes.value['non-existent-value.txt']);
    });
  });
});
