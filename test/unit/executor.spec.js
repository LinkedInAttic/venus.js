/**
 * @author LinkedIn
 */
var expect      = require('expect.js'),
    sinon       = require('sinon'),
    executor    = require('../../lib/executor'),
    testHelper  = require('../lib/helpers'),
    testPath    = require('../lib/helpers').sampleTests,
    config      = require('../../lib/config'),
    path        = require('path'),
    executor    = require('../../lib/executor'),
    testcase    = require('../../lib/testcase'),
    testHelpers = require('../lib/helpers'),
    testPath    = require('../lib/helpers').sampleTests,
    path        = require('path');

describe('lib/executor', function() {

  before(function () {
    config.cwd = testHelpers.fakeCwd();
  });

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    expect(executor.foo).to.be(undefined);
  });

  it('should parse testcases from test string correctly', function() {
    var exec = new executor.Executor(),
        tests = testPath( 'foo' ) + ',' + testPath( 'bar' ),
        result;

    result = exec.parseTests(tests);
    expect(result).to.be.ok();
    expect(Object.keys(result).length).to.be(2);
  });

  it('should handle parsing testcases from undefined test string', function() {
    var exec = new executor.Executor(),
        tests,
        result;

    result = exec.parseTests(tests);
    expect(result).to.be.ok();
    expect(Object.keys(result).length).to.be(0);
  });

  it('should handle tests being specified with a .js file extension', function() {
    var exec   = new executor.Executor(),
        tests  = testPath( 'foo.js' ),
        result = exec.parseTests(tests);

    expect(Object.keys(result).length).to.be(1);
  });

  it('should enforce require annotations option by default', function () {
    var exec   = new executor.Executor(),
        tests  = testPath('require_annotations'),
        result;

    result = exec.parseTests(tests);
    expect(Object.keys(result).length).to.be(1);
  });

  it('should not enforce require annotations option if specified', function () {
    var exec   = new executor.Executor(),
        tests  = testPath('require_annotations'),
        result;

    exec.requireTestAnnotations = false;
    result = exec.parseTests(tests);
    expect(Object.keys(result).length).to.be(2);
  });

  it('should parse comments in test cases', function() {
    var exec   = new executor.Executor(),
        tests  = testPath( 'parse_comments' ),
        result = exec.parseTests(tests),
        first;

    first = Object.keys(result)[0];

    expect(result).to.be.ok();
    expect(result[first]).to.be.ok();
    expect(result[first].annotations['venus-library']).to.be('mocha');
    expect(result[first].annotations['venus-include'].length).to.be(2);
    expect(result[first].annotations['venus-include-group'].length).to.be(1);
  });

  it('parseTestPaths should omit .venus folder', function() {
    var exec      = new executor.Executor(),
        testPaths = [testPath('.venus')],
        result;

    result = exec.parseTestPaths(testPaths);

    expect(Object.keys(result).length).to.be(0);
  });

  describe('specify hostname on command line', function () {
    var conf = testHelper.testConfig(),
        exec = new executor.Executor(conf),
        test = testPath('parse_comments'),
        options,
        url;

    options = {
      hostname: 'foobar.com',
      test: test
    };

    exec.init(options);
    url = exec.testgroup.testArray[0].url.run;

    it('should use the hostname specified on command line', function () {
      expect(url.indexOf('http://foobar.com')).to.be(0);
    });
  });

  describe('specify hostname through config', function () {
    var exec = new executor.Executor(testHelper.testConfig()),
        test = testPath('parse_comments'),
        options,
        url;

    options = {
      test: test
    };

    exec.init(options);
    url = exec.testgroup.testArray[0].url.run;

    it('should use the hostname specified in config', function () {
      expect(url.indexOf('http://barfoo.com')).to.be(0);
    });
  });

  describe('createTestObjects', function() {
    it('should create config file when called with single file', function() {
      var exec         = new executor.Executor(),
          mock         = sinon.mock(exec),
          test         = testPath('foo.js'),
          testcaseMock = sinon.mock(testcase),
          configMock   = sinon.mock(config),
          hostname     = require('../../lib/constants').hostname;

      // Expectations
      mock.expects('getNextTestId').once().returns(1);
      configMock.expects('getConfig').once().returns('configFile');
      testcaseMock.expects('create').once().withExactArgs({
        path: test,
        id: 1,
        runUrl: 'http://' + hostname + ':' + exec.port + exec.urlNamespace + '/1',
        instrumentCodeCoverate: exec.instrumentCodeCoverage,
        config: 'configFile',
        hotReload: true
      });

      exec.createTestObjects([test]);

      // config.cwd is the dir of the file being tested
      expect(config.cwd).to.be(path.dirname(test));

      // Verify expectations
      mock.verify();
      configMock.verify();
      testcaseMock.verify();
    });
  });
});
