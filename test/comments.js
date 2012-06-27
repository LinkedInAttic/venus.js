/**
 * @author LinkedIn
 */
var sinonChai     = require('./lib/sinon-chai');
var commentParser = require('../lib/comments');
var fs            = require('fs');
var hostname      = require('os').hostname();

describe('lib/docparser', function() {

  it('should parse comment groups', function() {
      var comments = '/**\n* @framework mocha \n*@dep /var/www/html\n**/';
      var config = commentParser.parse(comments);

      config.should.have.length(1);
  });

});
