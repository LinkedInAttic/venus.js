var Config = v.lib('Config');

describe('config', function () {
  var config;

  before(function () {
    config = new Config();
  });

  it('should return config context', function () {
    var testFile = v.path('fixtures', 'projects', 'project_a', 'test.spec.js');

    var ctx = config.ctx(testFile);
    debugger;
    v.assert.deepEqual(ctx.get('includeGroup'), ['normal']);
  });
});
