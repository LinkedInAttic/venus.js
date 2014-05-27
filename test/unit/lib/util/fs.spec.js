var v  = require('../../../helpers');
var fs = v.r('util/fs');

describe('lib/util/fs', function () {
  it('should be a file', function (done) {
    fs.isFile(__filename)
      .then(function (b) {
        v.assert.true(b);
        done();
      })
      .then(null, function (err) {
        done(err);
      });
  });

  it('should not be a file', function (done) {
    fs.isFile(__dirname)
      .then(function (b) {
        v.assert.false(b);
        done();
      })
      .then(null, function (err) {
        done(err);
      });
  });

  it('should be a directory', function (done) {
    fs.isDirectory(__dirname)
      .then(function (b) {
        v.assert.true(b);
        done();
      })
      .then(null, function (err) {
        done(err);
      });
  });

  it('should not be a directory', function (done) {
    fs.isDirectory(__filename)
      .then(function (b) {
        v.assert.false(b);
        done();
      })
      .then(null, function (err) {
        done(err);
      });
  });
});
