/**
 * @author LinkedIn
 */
'use strict';
var config        = require('../../lib/config'),
    sinon         = require('sinon'),
    path          = require('flavored-path'),
    expect        = require('expect.js'),
    testHelper    = require('../lib/helpers.js');

describe('lib/config', function() {
  var testConfig;

  before(function () {
    config.cwd = testHelper.fakeCwd();
    testConfig = testHelper.testConfig();
  });

  describe('searchforfile', function() {
    it('should find specified file', function() {
      var matches = config.searchForFile('.venus/');
      expect(matches.length).to.be(3);
    });
  });

  describe('searchPathForFile', function() {
    it('should return the matches of the file in the searchPath', function() {
      var matches = config.searchPathForFile('config');
      expect(matches.length).to.be(3);
    });
  });

  describe('loadFile', function() {
    it('should load a file in a config directory', function () {
      expect(config.loadFile('temp')).to.be('abc\n\n');
    });
  });

  describe('loadTemplate', function() {
    it('should call load file adding the template path and extension', function () {
      var mock = sinon.mock(config);
      mock.expects('loadFile').once().withExactArgs('templates/test.tl')
          .returns('content');

      expect(config.loadTemplate('test')).to.be('content');

      mock.verify();
    });
  });

  describe('parseConfigFile', function() {
    it('parses config file and makes paths absolute', function() {
      var defaultIncludes, expectedDefaultIncludes;

      defaultIncludes = testHelper.testConfig().get('includes.default');

      expectedDefaultIncludes = [
        testHelper.path(
          'data',
          'sample_fs',
          'projects',
          'webapp',
          'base',
          '.venus',
          'include',
          'file1.js'
        ),
        testHelper.path(
          'data',
          'sample_fs',
          'projects',
          'webapp',
          'base',
          '.venus',
          'include',
          'file2.js'
        )
      ];

      expect(defaultIncludes).to.eql(expectedDefaultIncludes);
    });
  });

  describe('getConfig', function() {
    var mock = sinon.mock(config),
        mergedConfig;

    mock.expects('searchPathForFile').once().withExactArgs('config')
        .returns(['somePath', 'otherPath']);
    mock.expects('parseConfigFile').once().withExactArgs('somePath')
        .returns({'a':'C','b':'B'});
    mock.expects('parseConfigFile').once().withExactArgs('otherPath')
        .returns({'a':'A','c':'D'});

    mergedConfig = config.getConfig();

    expect(mergedConfig.a).to.be('C');
    expect(mergedConfig.c).to.be('D');
    expect(mergedConfig.b).to.be('B');

    mock.verify();
  });

  describe('property resolution', function () {
    it('should work with valid nested properties', function () {
      var testConfig = testHelper.testConfig(),
          value      = testConfig.get('nested', 'level-1');

      expect(value).to.be('foo');
    });

    it('should work with invalid nested properties', function () {
      var testConfig = testHelper.testConfig(),
          value      = testConfig.get('basePaths', 'DNE');

      expect(value).to.be(null);
    });
  });

  describe('convert path keys to absolute paths', function () {
    it('should convert nested array of paths to absolute paths', function () {
      var bizPaths = testConfig.biz.bar.bizPathsfoo;
      expect(path.isAbsolute(bizPaths[0])).to.be(true);
    });

    it('should convert nested path key to absolute path', function () {
      var myPath = testConfig.biz.foobar[0].testPath;
      expect(path.isAbsolute(myPath)).to.be(true);
    });
  });

  describe('inherit property object values', function () {
    it('should include closest config values', function () {
      expect(testConfig.get('environments.ie8')).to.be.ok();
    });

    it('should include inherited values', function () {
      debugger;
      expect(testConfig.get('environments.phantom')).to.be.ok();
    });

  });
});
