/**
 * @author LinkedIn
 */
'use strict';
var should        = require('../lib/sinon-chai').chai.should(),
    constants     = require('../../lib/constants'),
    testHelper    = require('../lib/helpers');

describe('lib/constants', function () {

  it('should load correct interface', function () {
    var networkInterface = constants.getInterface();

    networkInterface.internal.should.be.false;
    networkInterface.family.should.eql('IPv4');
    networkInterface.address.split('.').length.should.eql(4);
  });
});
