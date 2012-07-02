/**
 * @author LinkedIn
 */
'use strict';
var should        = require('./lib/sinon-chai').chai.should(),
    Config        = require('../lib/Config'),
    fs            = require('fs');

describe('lib/Config', function() {

  describe('findConfigDirectory', function() {
    var config = new Config();
    it('should work', function() {
      config.findConfigDirectory(process.cwd());
    });
  });

});
