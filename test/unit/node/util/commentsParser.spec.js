/**
 * @author LinkedIn
 */
var expect     = require('expect.js'),
    parser     = require('../../../../lib/util/commentsParser'),
    testHelper = require('../../../lib/helpers'),
    fs         = require('fs'),
    annotation = require('../../../../lib/testcase').annotation;

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
        ' * @venus-include-group my_group \n',
        ' * @venus-include-group another_group \n',
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

    //  /**
    //   * @venus-include ../www/test-file.js
    //   */
    var commentsG = [
        '/**\n',
        ' * @venus-include ../www/test-file.js \n',
        ' */'
      ].join('');


    it('should handle an empty file', function() {
      var annotations = parser.parseStr(commentsD);
      expect(annotations).to.be.ok();
    });

    it('should handle an annotation with no value', function() {
      var annotations = parser.parseStr(commentsE);
      expect(annotations).to.be.ok();
      expect(annotations.hasOwnProperty('param')).to.be(true);
    });

    it('should handle a file with no comments', function() {
      var annotations = parser.parseStr(commentsC);
      expect(annotations).to.be.ok();
    });

    it('should parse 1 annotations object from 1 comment group', function() {
      var annotations   = parser.parseStr(commentsA);
      expect(annotations).to.be.ok();
    });

    it('should parse 1 annotations object from 2 comment groups', function() {
      var annotations = parser.parseStr(commentsB);
      expect(annotations).to.be.ok();
    });

    it('should parse unique annotations options correctly', function() {
      var annotations = parser.parseStr(commentsA);

      expect(annotations['venus-framework']).to.be('mocha');
    });

    it('should parse duplicated annotations options correctly, spanning multiple blocks', function() {
      var annotations = parser.parseStr(commentsB);

      expect(annotations[annotation.VENUS_INCLUDE]).to.eql(['/var/www/html', '/var/www/bar']);
    });

    it('should parse include groups correctly', function() {
      var annotations = parser.parseStr(commentsB);

      expect(annotations[annotation.VENUS_INCLUDE_GROUP]).to.eql(['my_group', 'another_group']);
    });

    it('should parse file paths correctly', function() {
      var comments = buildCommentBlock('@venus-include ~/var/foo_test.js'),
          annotations = parser.parseStr(comments);

      expect(annotations[annotation.VENUS_INCLUDE]).to.be('~/var/foo_test.js');

    });

    it('should parse file paths with dashes correctly', function() {
      var comments = buildCommentBlock('@venus-include ~/var/test-file.js'),
          annotations = parser.parseStr(comments);

      expect(annotations[annotation.VENUS_INCLUDE]).to.be('~/var/test-file.js');

    });

    it('should parse annotation values with spaces correctly', function() {
      var annotations = parser.parseStr(commentsF);
      expect(annotations[annotation.VENUS_FIXTURE]).to.be('<div class="sandbox"></div>');
    });

    it('should handle code with jshint style comment blocks', function () {
      var commentsJshint, annotations;

      commentsJshint = [
        '/*global describe, beforeEach*/ \n\n\n',
        'var foo = 234; \n',
      ].join('');

      annotations = parser.parseStr(commentsJshint);
      expect(annotations).not.to.be(undefined);
    });

    it('should handle @ symbols in spec file', function () {
      var commentsWithSymbol, annotations;

      //  /**
      //   * @venus-include ../www/test-file.js
      //   */
      //  var foo = 'ab@c.com';
      //  var boo = 'c@ba.moc';
      commentsWithSymbol = [
          '/**\n',
          ' * @venus-include ../www/test-file.js \n',
          ' */\n',
          'var foo = \'ab@c.com\';\n',
          'var boo = \'c@ba.moc\';\n',
          '/**\n',
          ' */\n'
        ].join('');

      annotations = parser.parseStr(commentsWithSymbol);
      expect(annotations[annotation.VENUS_INCLUDE]).to.be('../www/test-file.js');
      expect(Object.keys(annotations).length).to.be(1);
    });

    it('shouldn\'t fail on JSDoc comments', function() {
      var commentsWithJSDoc, annotations;

      //  /**
      //   * @type String
      //   */
      //  var a = 'my string';
      commentsWithJSDoc = [
        '/**\n',
        ' * @type String\n',
        ' */\n',
        'var a = \'my string\'',
      ].join('');

      annotations = parser.parseStr(commentsWithJSDoc);
      expect(annotations).not.to.be(undefined);

      //  /**
      //   * @param {Array} p
      //   * @private
      //   */
      //  function _myFirstPrivate(p) {}
      //  /**
      //   * @param {String} p
      //   * @private
      //   */
      //  function _mySecPrivate(p) {}
      commentsWithJSDoc = [
          '/**\n',
          ' * @param Array\n',
          ' * @private\n',
          ' */\n',
          'function _myFirstPrivate(p) {}\n',
          '/**\n',
          ' * @param String\n',
          ' * @private\n',
          ' */\n',
          'function _mySecPrivate(p) {}\n'
      ].join('');

      annotations = parser.parseStr(commentsWithJSDoc);
      expect(annotations).not.to.be(undefined);
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
