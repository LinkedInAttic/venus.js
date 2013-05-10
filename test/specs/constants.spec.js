/**
 * @author LinkedIn
 */
'use strict';
var should        = require('../lib/sinon-chai').chai.should(),
    constants     = require('../../lib/constants'),
    testHelper    = require('../lib/helpers');

describe('lib/constants', function () {

  it('should load correct interface', function () {
    var net = constants.getInterface();

    net.internal.should.not.be(true);
    net.family.should.eql('IPv4');
    net.address.split('.').length.should.be(4);
  });

      // var conf = new config.Config(testHelper.fakeCwd()),
});
