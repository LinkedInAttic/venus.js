/**
 * @author LinkedIn
 */
var should        = require('../lib/sinon-chai').chai.should(),
    pathHelper    = require('../../lib/util/pathHelper');

describe('lib/util/pathHelper', function() {

  describe('create helper', function() {
    var path = pathHelper('/test/var/foo');

    it('should have the correct path property', function() {
      path.path.should.eql('/test/var/foo');
    });
  });
});
