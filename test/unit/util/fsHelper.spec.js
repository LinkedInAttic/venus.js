/**
 * @author LinkedIn
 */
var expect = require('expect.js'),
    constants = require('../../../lib/constants'),
    fsHelper = require('../../../lib/util/fsHelper');

describe('lib/util/fsHelper', function() {
  describe('getTempDir()', function() {
    var getTempDir = fsHelper.getTempDir;

    it('should exist as getTempDir', function() {
      expect(getTempDir).to.be.ok();
    });

    it('should send back the defaults frmo getTempDir', function() {
      expect(getTempDir()).to.be('.venus_temp');
    });

    it('should accept a directory name', function() {
      var dirname = '.custom_temp_dir';
      expect(getTempDir({dirname: dirname})).to.be(dirname);
    });

    it('should be able to accept a port with the default venus dir', function() {
      var port = 1234;
      expect(getTempDir({port: port})).to.be('.venus_temp' + 1234);
    });

    it('should be able to accept both a directory name and port', function() {
      var dirname = 'leland-', port = 8000;
      expect(getTempDir({dirname: dirname, port: port})).to.be(dirname + port);
    });
  });

  describe('resolveTempDir()', function() {
    var basePath = constants.userHome + '/' + constants.tempDir;

    it('should exist as resolveTempDir', function() {
      expect(fsHelper.resolveTempDir).to.be.ok();
    });

    it('should resolve a path when provided no port and no argument', function() {
      var resolveTempDir = fsHelper.resolveTempDir();
      expect(resolveTempDir()).to.be(basePath + constants.port);
    });

    it('should resolve a path when provided a port and no arguments', function() {
      var resolveTempDir = fsHelper.resolveTempDir(1234);
      expect(resolveTempDir()).to.be(basePath + '1234');
    });

    it('should resolve a path when provided one argument', function() {
      var resolveTempDir = fsHelper.resolveTempDir(1234);
      expect(resolveTempDir('leland')).to.be(basePath + '1234/leland');
    });

    it('should resolve a path when provided two arguments', function() {
      var resolveTempDir = fsHelper.resolveTempDir(1234);
      expect(resolveTempDir('leland', 'fiona')).to.be(basePath + '1234/leland/fiona');
    });

    it('should resolve a path when provided three arguments', function() {
      var resolveTempDir = fsHelper.resolveTempDir(1234);
      expect(resolveTempDir('leland', 'fiona', 'erin')).to.be(basePath + '1234/leland/fiona/erin');
    });
  });
});

