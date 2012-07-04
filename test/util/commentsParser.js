/**
 * @author LinkedIn
 */
var should        = require('../lib/sinon-chai').chai.should(),
    parser        = require('../../lib/util/commentsParser'),
    fs            = require('fs');

describe('lib/util/commentsParser', function() {

  describe('parseStr', function() {
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

    //  var pirates = 'awesome';
    var commentsC = [
        'var pirates = \'awesome\';'
      ].join('');

    it('should handle a file with no comments', function() {
      var configData = parser.parseStr(commentsC);
      should.exist(configData);
    });

    it('should parse 1 configData object from 1 comment group', function() {
      var configData   = parser.parseStr(commentsA);
      should.exist(configData);
    });

    it('should parse 1 configData object from 2 comment groups', function() {
      var configData = parser.parseStr(commentsB);
      should.exist(configData);
    });

    it('should parse unique configData options correctly', function() {
      var configData = parser.parseStr(commentsA);

      should.exist(configData['venus-framework']);
      configData['venus-framework'].should.equal('mocha');
    });

    it('should parse duplicated configData options correctly, spanning multiple blocks', function() {
      var configData = parser.parseStr(commentsB);

      should.exist(configData['venus-include']);
      configData['venus-include'].should.eql(['/var/www/html', '/var/www/bar']);
    });
  });
});
