var v           = require('../../../helpers');
var annotations = v.r('util/annotations');

describe('lib/util/annotations', function () {
  describe('parse', function () {
    var ant;

    before(function (done) {
      annotations.parse(v.specPath('a.js'))
        .then(function (obj) {
          ant = obj;
          done();
        })
        .then(null, function (err) {
          done(err);
        });
    });

    it('should get @code annotation', function () {
      var expected = ['./**/*.js', 'foo.js'];
      v.assert.deepEqual(ant.code, expected);
    });

    it('should get @include annotation', function () {
      var expected = ['bar.js'];
      v.assert.deepEqual(ant.include, expected);
    });

    it('should get @include-group annotation', function () {
      var expected = ['normal'];
      v.assert.deepEqual(ant.includeGroup, expected);
    });

  });

  describe('camel', function () {
    it('should work on hyphenated string', function () {
      var result = annotations.camel('hello-there');
      v.assert.equal(result, 'helloThere');
    });

    it('not modify a camel cased string', function () {
      var result = annotations.camel('helloThere');
      v.assert.equal(result, 'helloThere');
    });

  });  
});
