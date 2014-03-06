var expect        = require('expect.js'),
    helpers       = require('../../helpers'),
    Venus         = helpers.lib('../Venus');
    PluginManager = helpers.lib('PluginManager');

describe('PluginManager', function () {
  var plugins, venus;

  beforeEach(function () {
    plugins = new PluginManager();
  });

  it('should continue on from an error', function () {
    venus = new Venus({
      plugins: ['stnahou'],
      info: false
    });

    plugins.load(venus);

    expect(Object.keys(plugins.instances).length).to.be(0);
  });

  it('should load a named plugin', function () {
    venus = new Venus({
      plugins: [helpers.path('fixtures/plugins/Simple')],
      info: false,
      debug: false
    });

    plugins.load(venus);

    expect(Object.keys(plugins.instances).length).to.be(1);
    expect(Object.keys(plugins.instances)[0]).to.be('SimplePlugin');
    expect(plugins.get('SimplePlugin').alert()).to.be('hello. goodbye');
  });

  it('should load an unnamed plugin', function () {
    var path = helpers.path('fixtures/plugins/SimpleNoName');

    venus = new Venus({
      plugins: [path],
      info: false,
      debug: false
    });

    plugins.load(venus);

    expect(Object.keys(plugins.instances).length).to.be(1);
    expect(Object.keys(plugins.instances)[0]).to.be(path);
    expect(plugins.get(path).alert()).to.be('hello. goodbye');
  });
});
