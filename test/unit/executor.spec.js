/**
 * @author LinkedIn
 */
var should      = require('../lib/sinon-chai').chai.should(),
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

  describe('selenium functionality - new API', function () {
    var exec = new executor.Executor(),
        test = testPath('parse_comments'),
        options,
        runner;

    options = {
      selenium: 'ioi.net',
      browser: 'chromeoid|21.0',
      test: test
    };

    exec.init(options);
    runner = exec.runners[0];

    it('should use chromeoid', function () {
      runner.client.desiredCapabilities.browserName.should.eql('chromeoid');
    });

    it('should use version 21', function () {
      runner.client.desiredCapabilities.version.should.eql('21.0');
    });

    it('should connect to ioi.net', function () {
      runner.options.host.should.eql('ioi.net');
    });

  });

  describe('selenium functionality - load from config', function () {
    var conf = testHelper.testConfig(),
        exec = new executor.Executor(conf),
        test = testPath('parse_comments'),
        options,
        runner;

    options = {
      selenium: true,
      test: test
    };

    exec.init(options);
    runner = exec.runners[0];

    it('should use netscape', function () {
      runner.client.desiredCapabilities.browserName.should.eql('netscape');
    });

    it('should connect to netscape.com', function () {
      runner.options.host.should.eql('netscape.com');
    });

    it('should use version 3', function () {
      runner.client.desiredCapabilities.version.should.eql(3);
    });

  });


  describe('sauce labs functionality - new API', function () {
    var exec = new executor.Executor(),
        test = testPath('parse_comments'),
        options,
        runner;

    options = {
      sauceLabs: 'ioi.net',
      browser: 'chromeoid|21.0',
      test: test
    };

    exec.init(options);
    runner = exec.runners[0];

    console.log(runner.client.host);

    it('should use chromeoid', function () {
      runner.client.desiredCapabilities.browserName.should.eql('chromeoid');
    });

    it('should use version 21', function () {
      runner.client.desiredCapabilities.version.should.eql('21.0');
    });

    it('should connect to ioi.net', function () {
      runner.options.host.should.eql('ioi.net');
    });

  });

  describe('sauce labs functionality - load from config', function () {
    var conf = testHelper.testConfig(),
        exec = new executor.Executor(conf),
        test = testPath('parse_comments'),
        options,
        runner;

    options = {
      sauceLabs: true,
      test: test
    };

    exec.init(options);
    runner = exec.runners[0];

    it('should use firefox', function () {
      runner.client.desiredCapabilities.browserName.should.eql('firefox');
    });

    it('should connect to ondemand.saucelabs.com', function () {
      runner.options.host.should.eql('ondemand.saucelabs.com');
    });

    it('should use version 20', function () {
      runner.client.desiredCapabilities.version.should.eql(20);
    });

  });


  describe('selenium functionality - legacy API', function () {
    var exec = new executor.Executor(),
        test = testPath('parse_comments'),
        options,
        runner;

    options = {
      selenium: true,
      seleniumServer: 'foo.biz',
      seleniumBrowser: 'froogle',
      test: test
    };

    exec.init(options);
    runner = exec.runners[0];

    it('should use froogle', function () {
      runner.client.desiredCapabilities.browserName.should.eql('froogle');
    });

    it('should connect to foo.biz', function () {
      runner.options.host.should.eql('foo.biz');
    });

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
      url.indexOf('http://foobar.com').should.eql(0);
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
      url.indexOf('http://barfoo.com').should.eql(0);
    });
  });

  describe('parseTestPaths', function() {
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
        config: 'configFile'
      });

      exec.parseTestPaths([test]);

      // config.cwd is the dir of the file being tested
      config.cwd.should.eql(path.dirname(test));

      // Verify expectations
      mock.verify();
      configMock.verify();
      testcaseMock.verify();
    });
  });
});
