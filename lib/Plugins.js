'use strict';

var path     = require('path');
var Promise  = require('bluebird');
var VenusCtx = require('./VenusCtx');

module.exports = Plugins;

/**
 * Plugin Manager
 * @constructor
 * @param {Kernel} kernel - Venus kernel object
 */
function Plugins(kernel) {
  this.config    = kernel.config;
  this.configCtx = this.config.ctx();
  this.run       = this.exec.bind(this, 'run');
  this.attach    = this.exec.bind(this, 'attach');
  this.init      = this.exec.bind(this, 'init');
  this.exit      = this.exec.bind(this, 'exit');
}

/**
 * Instantiate all plugins, specified in config
 * @returns {Promise}
 */
Plugins.prototype.instantiate = function () {
  return new Promise(function (resolve, reject) {
    var configCtx      = this.configCtx;
    var defaultPlugins = configCtx.getWithMeta('defaultPlugins');
    var plugins        = configCtx.getWithMeta('plugins');

    this.pluginInstances = {};

    if (typeof defaultPlugins.value === 'object') {
      Object
        .keys(defaultPlugins.value)
        .map(this.getValue.bind(this, defaultPlugins))
        .forEach(this.instantiatePlugin, this);
    }

    if (typeof plugins.value === 'object') {
      Object
        .keys(plugins.value)
        .map(this.getValue.bind(this, plugins))
        .forEach(this.instantiatePlugin, this);
    }

    resolve();
  }.bind(this));
};

/**
 * Return item from object
 */
Plugins.prototype.getValue = function (obj, key) {
  return {
    name: key,
    data: obj.value[key],
    meta: obj.meta
  };
};

/**
 * Instantiate a plugin
 * @param {object} p
 */
Plugins.prototype.instantiatePlugin = function (p) {
  var plugin;
  var PluginConstructor;
  var pluginPath;
  var venus;
  var cwd = this.config.cwd;

  if (p.meta.type === 'file') {
    cwd = p.meta.dir;
  }

  if (typeof p.data === 'string') {
    pluginPath = p.data;
  } else if (typeof p.data.path === 'string') {
    pluginPath = p.data.path;
  } else {
    pluginPath = p.name;
  }

  try {
    PluginConstructor = require(pluginPath);
  }
  catch (e1) {
    try {
      pluginPath        = path.resolve(cwd, pluginPath);
      PluginConstructor = require(pluginPath);
    } catch (e) {
      throw new Error('Unable to instantiate plugin: ' + pluginPath + e1.stack);
    }
  }

  var config = this.config.ctx();
  config.addStore({
    provider: 'literal',
    data: p.data
  }, 1);

  venus  = new VenusCtx(PluginConstructor.prototype.name, config, this.pluginInstances);
  plugin = new PluginConstructor(venus);

  try {
    this.add(plugin, p);
  } catch (e) {
    throw Error(e);
  }
};

/**
 * @param {object} plugin - plugin to add
 * @param {string} p - plugin source path
 */
Plugins.prototype.add = function (plugin, p) {
  if (!plugin.name) {
    throw new Error('Plugin loaded from ' + p + ' is missing the name property');
  }

  if (this.pluginInstances[plugin.name]) {
    throw new Error('Plugin name collision: ' + plugin.name);
  }

  this.pluginInstances[plugin.name] = plugin;
};

/**
 * Run
 */
Plugins.prototype.exec = function (method) {
  return Promise.all(
    Object
      .keys(this.pluginInstances)
      .map(function (key) {
        var plugin = this.pluginInstances[key];

        if (typeof plugin[method] === 'function') {
          return this.pluginInstances[key][method]();
        }
      }, this)
  );
};
