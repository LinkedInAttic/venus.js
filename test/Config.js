/**
 * @author LinkedIn
 */
'use strict';
var should        = require('./lib/sinon-chai').chai.should(),
    Config        = require('../lib/Config'),
    fs            = require('fs');

describe('lib/Config', function() {

  //describe('findConfigs', function() {
    //var config = new Config();
    //it('should work', function() {
      //config.findConfigs(process.cwd());
    //});
  //});

  //describe('buildLookupChain', function() {
    //var config = new Config();
    //it('should work', function() {
      //console.log(JSON.stringify(config.buildLookupChain(process.cwd())));
    //});
  //});

  describe('get', function() {
    var config = new Config(process.cwd());

    it('should get the closest value for a property', function() {
      console.log( config.get('libraries.jasmine') );
    });
  });
});
