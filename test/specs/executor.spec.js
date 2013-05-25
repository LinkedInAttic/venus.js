/**
 * @author LinkedIn
 */
var should       = require('../lib/sinon-chai').chai.should(),
    sinon        = require('sinon'),
    executor     = require('../../lib/executor'),
    testcase     = require('../../lib/testcase'),
    testHelpers  = require('../lib/helpers'),
    testPath     = require('../lib/helpers').sampleTests,
    path         = require('path'),
    configHelper = require('../../lib/config');

describe('lib/executor', function() {

  before(function () {
    configHelper.cwd = testHelpers.fakeCwd();
  });

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    should.not.exist(executor.foo);
  });

  it('should parse testcases from test string correctly', function() {
    var exec = new executor.Executor(),
        tests = testPath( 'foo' ) + ',' + testPath( 'bar' ),
        result;

    result = exec.parseTests(tests);
    should.exist(result);
    Object.keys(result).length.should.eql(3);
  });

  it('should handle parsing testcases from undefined test string', function() {
    var exec = new executor.Executor(),
        tests,
        result;

    result = exec.parseTests(tests);
    should.exist(result);
    Object.keys(result).length.should.eql(0);
  });

  it('should handle tests being specified with a .js file extension', function() {
    var exec   = new executor.Executor(),
        tests  = testPath( 'foo.js' ),
        result = exec.parseTests(tests);

    Object.keys(result).length.should.eql(1);
  });

  it('should enforce require annotations option if specified', function () {
    var exec   = new executor.Executor(),
        tests  = testPath('require_annotations'),
        result;

    exec.requireTestAnnotations = true;
    result = exec.parseTests(tests);
    Object.keys(result).length.should.eql(1);
  });

  it('should not enforce require annotations option if not specified', function () {
    var exec   = new executor.Executor(),
        tests  = testPath('require_annotations'),
        result;

    result = exec.parseTests(tests);
    Object.keys(result).length.should.eql(2);
  });

  it('should parse comments in test cases', function() {
    var exec   = new executor.Executor(),
        tests  = testPath( 'parse_comments' ),
        result = exec.parseTests(tests),
        first;

    first = Object.keys(result)[0];

    should.exist(result);
    should.exist(result[first]);
    result[first].annotations['venus-library'].should.eql('mocha');
    result[first].annotations['venus-include'].should.have.length(2);
    result[first].annotations['venus-include-group'].should.have.length(1);
  });

  it('parseTestPaths should omit .venus folder', function() {
    var exec      = new executor.Executor(),
        testPaths = [testPath('.venus')],
        result;

    result = exec.parseTestPaths(testPaths);

    Object.keys(result).length.should.eql(0);
  });

  describe('parseTestPaths', function() {
    it('should create config file when called with single file', function() {
      var exec         = new executor.Executor(),
          mock         = sinon.mock(exec),
          test         = testPath('foo.js'),
          testcaseMock = sinon.mock(testcase),
          configMock   = sinon.mock(configHelper),
          hostname     = require('os').hostname();

      // Expectations
      mock.expects('getNextTestId').once().returns(1);
      configMock.expects('getConfig').once().returns('configFile');
      testcaseMock.expects('create').once().withExactArgs({
        path: test,
        id: 1,
        runUrl: 'http://' + hostname + ':' + exec.port + exec.urlNamespace + '/1',
        instrumentCodeCoverate: exec.instrumentCodeCoverage,
        config: 'configFile'
      });

      exec.parseTestPaths([test]);

      // configHelper.cwd is the dir of the file being tested
      configHelper.cwd.should.eql(path.dirname(test));

      // Verify expectations
      mock.verify();
      configMock.verify();
      testcaseMock.verify();
    });
  });
});
