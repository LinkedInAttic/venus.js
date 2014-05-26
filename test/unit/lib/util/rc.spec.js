var v  = require('../../../helpers');
var rc = v.r('util/rc');

describe('.venusrc helper', function () {
  describe('pickRcFiles', function () {
    var input, output, expected;

    before(function (done) {
      input = [
        v.path('..'),
        v.path(),
        v.path('fixtures'),
        v.path('fixtures', 'projects'),
        v.path('fixtures', 'projects', 'project_a')
      ];

      expected = [
        v.path('..', '.venusrc'),
        v.path('fixtures', 'projects', 'project_a', '.venusrc')
      ];

      rc.pickRcFiles(input).then(function (paths) {
        output = paths;
        done();
      })
      .then(null, function (e) {
        done(e);
      });
    });

    it('should pick the right directories', function () {
      v.assert.deepEqual(output, expected);
    });
  });

  describe('buildRcLookupPaths', function () {
    it('should return paths', function () {
      v.assert.equal(rc.buildRcLookupPaths(__dirname).length >= 4, true);
    });
  });

  describe('loadRc', function () {
    it('should return objects', function (done) {
      var startPath = v.projectPath('project_a');
      rc.loadRc(startPath).then(function (list) {
        v.assert.equal(list[list.length - 1].watch, true);
        done();
      });
    });
  });

});
