/**
 * @author LinkedIn
 */
var expect        = require('expect.js'),
    pathHelper    = require('../../../lib/util/pathHelper');

describe('lib/util/pathHelper', function() {

  describe('create helper', function() {
    var path = pathHelper('/test/var/foo');

    it('should have the correct path property', function() {
      expect(path.path).to.be('/test/var/foo');
    });
  });

  describe('file', function() {

    it('should return filename', function() {
      var path = pathHelper('/test/var/foo');
      expect(path.file).to.be('foo');
    });

    it('should return directory name', function() {
      var path = pathHelper('/test/var/foo/');
      expect(path.file).to.be('foo/');
    });

  });
});
