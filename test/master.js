/**
 * @author LinkedIn
 */
var should    = require('./lib/sinon-chai').chai.should(),
    master    = require('../lib/master'),
    hostname  = require('os').hostname();

describe('lib/master', function() {

  it('should have the correct default url', function() {
      var defaultMasterUrl = ['http://', hostname, ':', '2012'].join('');
      master.defaultUrl.should.equal(defaultMasterUrl);
  });


});
