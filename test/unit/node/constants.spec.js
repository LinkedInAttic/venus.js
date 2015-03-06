/**
 * @author LinkedIn
 */
'use strict';
var expect        = require('expect.js'),
    constants     = require('../../lib/constants');

describe('lib/constants', function () {

  it('should load correct interface', function () {
    var networkInterface = constants.getInterface();

    expect(networkInterface.internal).to.be(false);
    expect(networkInterface.family).to.be('IPv4');
    expect(networkInterface.address.split('.').length).to.be(4);
  });
});
