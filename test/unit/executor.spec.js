/**
 * @author LinkedIn
 */
var expect      = require('expect.js'),
    sinon       = require('sinon'),
    executor    = require('../../lib/executor'),
    coverage    = require('../../lib/coverage'),
    testHelper  = require('../lib/helpers'),
    testPath    = require('../lib/helpers').sampleTests,
    config      = require('../../lib/config'),
    path        = require('path'),
    executor    = require('../../lib/executor'),
    testcase    = require('../../lib/testcase'),
    testHelpers = require('../lib/helpers'),
    testPath    = require('../lib/helpers').sampleTests,
    path        = require('path'),
    fs          = require('fs'),
    fstools     = require('fs-tools'),
    deferred    = require('deferred'),
    logger      = require('../../lib/util/logger');

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

  it('should fail when a specified test file or folder does not exist', function (){
    var exec = new executor.Executor(),
        logger = sinon.stub(exec.logger,'error'),
        exit = sinon.stub(process, 'exit'),
        tests = testPath('bad_non_existent_file_path');

    //Expect an exception and a call to process.exit
    expect(function() {
      exec.parseTests(tests);
    }).to.throwException();
    expect(exit.calledOnce).to.be(true);

    //Restore stubs
    exit.restore();
    logger.restore();
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
      test: test,
      homeFolder: path.resolve(__dirname, '..', '..')
    };


    it('should use the hostname specified on command line', function (done) {
      exec.init(options).then(function () {
        url = exec.testgroup.testArray[0].url.run;
        expect(url.indexOf('http://foobar.com')).to.be(0);
        done();
      });
    });
  });

  describe('specify hostname through config', function () {
    var exec = new executor.Executor(testHelper.testConfig()),
        test = testPath('parse_comments'),
        options,
        url;

    options = {
      test: test,
      homeFolder: path.resolve(__dirname, '..', '..')
    };


    it('should use the hostname specified in config', function (done) {
      exec.init(options).then(function () {
        url = exec.testgroup.testArray[0].url.run;
        expect(url.indexOf('http://barfoo.com')).to.be(0);
        done();
      });
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
        runPath: exec.urlNamespace + '/1',
        instrumentCodeCoverate: exec.instrumentCodeCoverage,
        config: 'configFile',
        hotReload: true,
        port: exec.port
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

  describe('shutdown', function() {
    beforeEach(function() {
      sinon.stub(coverage, 'writeSummary');
      sinon.stub(process, 'exit');
    });

    afterEach(function() {
      coverage.writeSummary.restore();
      process.exit.restore();
    });

    it('should exit with status 1 if there are errors', function() {
      var exec = new executor.Executor();
      exec.testgroup = {};
      exec.reporter = {
        errored: true,
        emit: sinon.spy()
      };

      exec.shutdown();

      expect(process.exit.args[0][0]).to.be(1);
    });
  });

  describe('sendGenericError', function() {
    beforeEach(function() {
      sinon.stub(logger, 'error');
      sinon.stub(process, 'exit');
    });

    afterEach(function() {
      logger.error.restore();
      process.exit.restore();
    });

    it('should send an error and kill the process', function() {
      var exec = new executor.Executor();
      exec.sendGenericError('someMethod', new Error('way to go dummy'));
      sinon.assert.calledTwice(logger.error);
      sinon.assert.calledWith(logger.error, 'Error occurred at someMethod.');
      sinon.assert.calledWith(logger.error, 'Error: way to go dummy');
      sinon.assert.calledWith(process.exit, 1);
    });
  });

  describe('setPort', function() {
    it('should accept a valid port number', function(done) {
      var exec = new executor.Executor(),
          port = 1234;

      exec.setPort(port).then(function() {
        expect(exec.port).to.be(port);
        done();
      });
    });

    it('should reject the promise when an invalid port is passed in', function(done) {
      var exec = new executor.Executor();

      exec.setPort('I am a bad port').catch(function(e) {
        expect(e.message).to.contain('no port');
        done();
      });
    });

    it('should reject the promise when no port is passed in', function(done) {
      var exec = new executor.Executor();

      exec.setPort().catch(function(e) {
        expect(e.message).to.contain('no port');
        done();
      });
    });
  });

  describe('removeExistingTests', function() {
    var exec, testDir;

    function removeTestDir() {
      var def = deferred();

      fstools.remove(testDir, function() {
        def.resolve();
      });

      return def.promise;
    }

    function makeTestDir() {
      var def = deferred();

      fstools.mkdir(testDir, '0755', function() {
        def.resolve();
      });

      return def.promise;
    }

    function testDirExists() {
      var def = deferred();

      fs.exists(testDir, function(exists) {
        def.resolve(exists);
      });

      return def.promise;
    }

    beforeEach(function(done) {
      var def = deferred();

      exec = new executor.Executor();
      exec.port = 1234;
      exec.setupVenusTemp();
      testDir = exec.venusTemp('test');

      testDirExists()
        .then(removeTestDir, done)
        .then(done);
    });

    afterEach(function(done) {
      testDirExists()
        .then(removeTestDir, done)
        .then(done);
    });

    it('should remove the directory if it already existed', function(done) {
      makeTestDir()
        .then(testDirExists)
        .then(function(exists) {
          expect(exists).to.be.ok();
        })
        .then(function() {
          exec
            .removeExistingTests()
            .then(testDirExists)
            .then(function(exists) {
              expect(exists).to.not.be.ok();
              done();
            });
        });
    });

    it('should attempt to remove the directory even if it does not exist', function(done) {
      removeTestDir()
        .then(testDirExists)
        .then(function(exists) {
          expect(exists).to.not.be.ok();
        })
        .then(function() {
          exec
            .removeExistingTests()
            .then(testDirExists)
            .then(function(exists) {
              expect(exists).to.not.be.ok();
              done();
            });
        });
    });
  });
});
