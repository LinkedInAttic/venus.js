/**
 * @author LinkedIn
 */
var sinonChai = require('./lib/sinon-chai');
var master  = require('../lib/master');
var hostname  = require('os').hostname();

describe('lib/master', function() {

  it('should have the correct default url', function() {
      var defaultMasterUrl = ['http://', hostname, ':', '2012'].join('');
      master.defaultUrl.should.equal(defaultMasterUrl);
  });


});
