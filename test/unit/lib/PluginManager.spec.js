var expect        = require('expect.js'),
    helpers       = require('../../helpers'),
    Venus         = helpers.lib('../Venus');
    PluginManager = helpers.lib('PluginManager'),
    q             = require('q');

describe('PluginManager', function () {
  var plugins, pluginMgr, venus;

  beforeEach(function () {
    pluginMgr = new PluginManager();
    plugins   = {};
  });

  it('should continue on from an error', function () {
    plugins['stnahou'] = {};

    venus = new Venus({
      plugins: plugins,
      info: false
    });

    pluginMgr.load(venus);

    expect(Object.keys(pluginMgr.instances).length).to.be(0);
  });

  it('should load a named plugin', function () {
    plugins[helpers.path('fixtures/plugins/Simple')] = {};

    venus = new Venus({
      plugins: plugins,
      info: false,
      debug: false
    });

    pluginMgr.load(venus);

    expect(Object.keys(pluginMgr.instances).length).to.be(1);
    expect(Object.keys(pluginMgr.instances)[0]).to.be('SimplePlugin');
    expect(pluginMgr.get('SimplePlugin').alert()).to.be('hello. goodbye');
  });

  it('should load an unnamed plugin', function () {
    var path = helpers.path('fixtures/plugins/SimpleNoName');
    plugins[path] = {};

    venus = new Venus({
      plugins: plugins,
      info: false,
      debug: false
    });

    pluginMgr.load(venus);

    expect(Object.keys(pluginMgr.instances).length).to.be(1);
    expect(Object.keys(pluginMgr.instances)[0]).to.be(path);
    expect(pluginMgr.get(path).alert()).to.be('hello. goodbye');
  });

  it('should wait for all plugins to load', function (done) {
    var promises;

    plugins[helpers.path('fixtures/plugins/Simple')] = {};
    plugins[helpers.path('fixtures/plugins/AsyncLoad')] = {};
    plugins[helpers.path('fixtures/plugins/AsyncLoad2')] = {};

    venus = new Venus({
      plugins: plugins,
      info: false,
      debug: false
    });

    promises = pluginMgr.load(venus);

    expect(promises.length).to.be(2);

    q.all(promises).then(function () {
      done();
    });

  });
});
