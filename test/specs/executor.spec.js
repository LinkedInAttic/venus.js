/**
 * @author LinkedIn
 */
var should     = require('../lib/sinon-chai').chai.should(),
    sinon      = require('sinon'),
    executor   = require('../../lib/executor');

describe('lib/executor', function() {

  it('should not be modifiable', function() {
    executor.foo = 'bar';
    should.not.exist(executor.foo);
  });

  it('should parse testcases from test string correctly', function() {
    var exec = new executor.Executor(),
        tests = 'test/data/sample_tests/foo,test/data/sample_tests/bar',
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
        tests  = 'test/data/sample_tests/foo.js',
        result = exec.parseTests(tests);

    Object.keys(result).length.should.eql(1);
  });

  it('should parse comments in test cases', function() {
    var exec   = new executor.Executor(),
        tests  = 'test/data/sample_tests/parse_comments',
        result = exec.parseTests(tests),
        first;

    first = Object.keys(result)[0];

    should.exist(result);
    should.exist(result[first]);
    result[first].annotations['venus-library'].should.eql('mocha');
    result[first].annotations['venus-include'].should.have.length(2);
    result[first].annotations['venus-include-group'].should.have.length(1);
  });

  it('should create phantom clients if correct flag is set', function() {
    var exec   = new executor.Executor(),
        config = { phantom: true, test: 'test/data/sample_tests/foo' },
        spy    = sinon.spy(exec, 'createPhantomRunners');

    exec.init(config);
    spy.callCount.should.eql(1);
  });

});
