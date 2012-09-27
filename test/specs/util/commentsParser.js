/**
 * @author LinkedIn
 */
var should        = require('../../lib/sinon-chai').chai.should(),
    parser        = require('../../../lib/util/commentsParser'),
    testHelper    = require('../../lib/helpers'),
    fs            = require('fs'),
    annotation    = require('../../../lib/testcase').annotation;

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

    //  (empty)
    var commentsD = '';

    //  /**
    //   * @param
    //   */
    var commentsE = [
        '/** \n',
        ' * @param \n',
        ' */ \n',
        '\n',
      ].join('');

    //  /**
    //   * @venus-fixture   <div class="sandbox"></div>
    //   */
    var commentsF = [
      '/** \n',
      ' * @venus-fixture <div class="sandbox"></div>\n',
      ' */ \n'
    ].join('');

    it('should handle an empty file', function() {
      var annotations = parser.parseStr(commentsD);
      should.exist(annotations);
    });

    it('should handle an annotation with no value', function() {
      var annotations = parser.parseStr(commentsE);
      should.exist(annotations);
      annotations.hasOwnProperty('param').should.be.true;
    });

    it('should handle a file with no comments', function() {
      var annotations = parser.parseStr(commentsC);
      should.exist(annotations);
    });

    it('should parse 1 annotations object from 1 comment group', function() {
      var annotations   = parser.parseStr(commentsA);
      should.exist(annotations);
    });

    it('should parse 1 annotations object from 2 comment groups', function() {
      var annotations = parser.parseStr(commentsB);
      should.exist(annotations);
    });

    it('should parse unique annotations options correctly', function() {
      var annotations = parser.parseStr(commentsA);

      should.exist(annotations['venus-framework']);
      annotations['venus-framework'].should.equal('mocha');
    });

    it('should parse duplicated annotations options correctly, spanning multiple blocks', function() {
      var annotations = parser.parseStr(commentsB);

      should.exist(annotations[annotation.VENUS_INCLUDE]);
      annotations[annotation.VENUS_INCLUDE].should.eql(['/var/www/html', '/var/www/bar']);
    });

    it('should parse file paths correctly', function() {
      var comments = buildCommentBlock('@venus-include ~/var/foo_test.js'),
          annotations = parser.parseStr(comments);

      should.exist(annotations);
      should.exist(annotations[annotation.VENUS_INCLUDE]);
      annotations[annotation.VENUS_INCLUDE].should.eql('~/var/foo_test.js');

    });

    it('should parse annotation values with spaces correctly', function() {
      var annotations = parser.parseStr(commentsF);
      should.exist(annotations);
      should.exist(annotations[annotation.VENUS_FIXTURE]);
      annotations[annotation.VENUS_FIXTURE].should.equal('<div class="sandbox"></div>');
    });
  });

  /**
   * Build a multi line comment block
   */
  function buildCommentBlock() {
    var lines = Array.prototype.slice.call(arguments),
        comment = ['/** \n'];

    lines.forEach(function(line) {
      comment.push(' * ' + line + ' \n');
    });

    comment.push(' */ \n');

    return comment.join('');
  }
});
