/**
 * @author LinkedIn
 */
var should    = require('../lib/sinon-chai').chai.should(),
    overlord  = require('../../lib/overlord'),
    hostname  = require('os').hostname();

describe('lib/overlord', function() {

  it('should have the correct default url', function() {
      var defaultOverlordUrl = ['http://', hostname, ':', '2012'].join('');
      overlord.defaultUrl.should.equal(defaultOverlordUrl);
  });


});
