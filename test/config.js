/**
 * @author LinkedIn
 */
var should        = require('./lib/sinon-chai').should();
    commentParser = require('../lib/config');
    fs            = require('fs');
    hostname      = require('os').hostname();

describe('lib/comments', function() {
  //  /**
  //   * @venus-framework mocha
  //   * @venus-include /var/www/html
  //   */
  var commentsA = [
      '/**\n',
      ' * @venus-framework mocha \n',
      ' * @venus-include /var/www/html \n',
      ' */'
    ].join('');

  //  /**
  //   * @venus-framework mocha
  //   * @venus-include /var/www/html
  //   */
  //
  //   var foo = 234;
  //
  //   /**
  //    * @venus-include /var/www/bar
  //    */
  var commentsB = [
      '/** \n',
      ' * @venus-framework mocha \n',
      ' * @venus-include /var/www/html \n',
      ' */ \n',
      '\n',
      'var foo = 234; \n',
      '\n',
      '/** \n',
      ' * @venus-include /var/www/bar \n',
      ' */ \n'
    ].join('');

  it('should parse 1 config object from 1 comment group', function() {
      var config   = commentParser.parseComments(commentsA);
      should.exist(config);
  });

  it('should parse 1 config object from 2 comment groups', function() {
      var config = commentParser.parseComments(commentsB);
      should.exist(config);
  });

  it('should parse unique config options correctly', function() {
      var config = commentParser.parseComments(commentsA);

      should.exist(config['venus-framework']);
      config['venus-framework'].should.equal('mocha');
  });

  it('should parse duplicated config options correctly, spanning multiple blocks', function() {
      var config = commentParser.parseComments(commentsB);

      should.exist(config['venus-include']);
      config['venus-include'].should.eql(['/var/www/html', '/var/www/bar']);
  });
});
