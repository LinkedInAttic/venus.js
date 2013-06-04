/**
 * @author LinkedIn
 */
var should     = require('../lib/sinon-chai').chai.should(),
    sinon      = require('sinon'),
    executor   = require('../../lib/executor'),
    testHelper = require('../lib/helpers'),
    testPath   = require('../lib/helpers').sampleTests,
    config     = require('../../lib/config'),
    path       = require('path');

describe('lib/executor', function() {

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

  // it('should emit "tests-loaded" event', function(done) {
    // var exec   = new executor.Executor(),
        // config = { phantom: true, test: testPath( 'foo' ) };

    // exec.on('tests-loaded', function (tests, options) {
      // tests.should.be.an.instanceOf(Array);
      // options.phantom.should.be.true;
      // done();
    // });

    // exec.init(config);
  // });

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
    var conf = new config.Config(testHelper.fakeCwd()),
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

      console.log(runner.client.host)

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
    var conf = new config.Config(testHelper.fakeCwd()),
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
    var conf = new config.Config(testHelper.fakeCwd()),
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

  describe('find test files', function() {
    var exec = new executor.Executor(testHelper.testConfig()),
        expected_test_list,
        tests;

    it('should get all test files with current directory as root directory', function() {
      expected_test_list = './examples/01-SimpleMochaTest/specs/Greeter.spec.js,./examples/02-SimpleQUnitTest/specs/Greeter.spec.js,./examples/03-SimpleJasmineTest/specs/Greeter.spec.js,./examples/04-AjaxControl-Mocha/specs/NusUpdate.spec.js,./examples/05-SimpleCasperTest/specs/linkedin-title-spec.js,./examples/06-SimpleCoverageTest/specs/Greeter.spec.js,./examples/07-RequireJS-Module/specs/Greeter.spec.js,./examples/08-ConsoleLog/specs/Log.spec.js,./node_modules/mocha/lib/reporters/spec.js,./node_modules/phantomjs-please/test/specs/Browser.spec.js,./node_modules/phantomjs-please/test/specs/PhantomJsPlease.spec.js,./test/specs/Binary.spec.js,./test/specs/config.spec.js,./test/specs/constants.spec.js,./test/specs/coverage.spec.js,./test/specs/executor.http.spec.js,./test/specs/executor.socketio.spec.js,./test/specs/executor.spec.js,./test/specs/testcase.spec.js,./test/specs/testrun.spec.js,./test/specs/uac/phantom.spec.js,./test/specs/util/commentsParser.spec.js,./test/specs/util/pathHelper.spec.js,./test/specs/Venus.spec.js';
      tests = exec.getTestFiles();
      tests.should.eql(expected_test_list);
    });

    it('should get all tests files from a given directory', function() {
      expected_test_list = 'test/specs/util//commentsParser.spec.js,test/specs/util//pathHelper.spec.js';
      tests = exec.getTestFiles("test/specs/util/");
      tests.should.eql(expected_test_list);
    });

    it('should return empty string if cannot find any test file', function() {
      expected_test_list = '';
      tests = exec.getTestFiles('css');
      tests.should.eql(expected_test_list);
    });
  });
});
