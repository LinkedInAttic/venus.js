/**
 * @author LinkedIn
 */
'use strict';
var should        = require('../lib/sinon-chai').chai.should(),
    config        = require('../../lib/config'),
    sinon         = require('sinon'),
    fsHelper      = require('../../lib/util/fsHelper'),
    fs            = require('fs'),
    path          = require('path'),
    pathHelper    = require('../../lib/util/pathHelper'),
    expect        = require('expect.js'),
    testHelper    = require('../lib/helpers.js');

describe('lib/config', function() {
  describe('searchforfile', function() {
    it('should find specified file', function() {
      var fsHelperMock,
          fsMock,
          pathMock,
          mock,
          matches;

      fsHelperMock = sinon.mock(fsHelper);
      fsMock = sinon.mock(fs);
      pathMock = sinon.mock(path);
      mock = sinon.mock(config);
      fsHelperMock.expects('searchUpwardsForFile').once()
          .returns('/upwards/path');
      fsMock.expects('existsSync').twice().returns(true);
      pathMock.expects('resolve').withExactArgs('~/.venus/').returns('somePath');
      pathMock.expects('resolve').withExactArgs('/some/path/.venus/')
          .returns('otherPath');
      mock.expects('getBinDirectory').once().returns('/some/path');

      matches = config.searchForFile('.venus/');

      matches.should.eql(['/upwards/path', 'somePath', 'otherPath']);

      mock.verify();
      pathMock.verify();
      fsMock.verify();
      fsHelperMock.verify();
    });
  });

  describe('searchPathForFile', function() {
    it('should return the matches of the file in the searchPath', function() {
      var mock,
          pathMock,
          fsMock;

      mock = sinon.mock(config);
      pathMock = sinon.mock(path);
      fsMock = sinon.mock(fs);
      mock.expects('searchForFile').once().withExactArgs('.venus/')
          .returns(['/fakePath']);
      pathMock.expects('resolve').once().withExactArgs('/fakePath/fakeFile').
          returns('/resolved');
      fsMock.expects('existsSync').returns(true);

      config.searchPathForFile('fakeFile').should.eql(['/resolved']);

      mock.verify();
      pathMock.verify();
      fsMock.verify();
    });
  });

  describe('loadFile', function() {
    it('should load a file in a config directory', function () {
      var mock,
          fsMock;

      mock = sinon.mock(config);
      fsMock = sinon.mock(fs);
      mock.expects('searchPathForFile').once().withExactArgs('someFile')
          .returns(['one', 'two']);
      fsMock.expects('readFileSync').once().withExactArgs('one').returns('abc');

      config.loadFile('someFile').should.eql('abc');

      mock.verify();
      fsMock.verify();
    });
  });

  describe('loadTemplate', function() {
    it('should call load file adding the template path and extension', function () {
      var mock = sinon.mock(config);
      mock.expects('loadFile').once().withExactArgs('templates/test.tl')
          .returns('content');

      config.loadTemplate('test').should.eql('content');

      mock.verify();
    });
  });

  describe('parseConfigFile', function() {
    it('parses config file and makes paths absolute', function() {
      var defaultIncludes, expectedDefaultIncludes;

      defaultIncludes = testHelper.testConfig().get('includes.default'),
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
});
