var ctx = require('./ctx'),
    log = require('./log');

module.exports = PluginManager;

/**
 * @class PluginManager
 * @constructor
 */
function PluginManager() {
  this.instances = {};
}

/**
 * Plugin instances
 * @property {object} instances
 */
PluginManager.prototype.instances = null;

/**
 * @method load
 * @param {Venus} venus app context
 */
PluginManager.prototype.load = function (venus) {
  var plugins = venus.config.plugins || [];

  // instantiate plugins
  plugins.forEach(function (pluginPath) {
    var pluginCtx;

    try {
      ConstructorFn = require(pluginPath);
      identifier    = ConstructorFn.prototype.name || pluginPath;

      if (this.instances[identifier]) {
        // Error, plugin with same name is already instantiated
        throw new Error();
      }

      pluginCtx = this.createVenusCtx(venus, identifier);

      this.instances[identifier] = new ConstructorFn(pluginCtx);
      venus.info('Plugin loaded:', venus.info.yellow(pluginPath));
    } catch (e) {
      venus.info('Plugin failed to load:', venus.info.red(pluginPath));
      venus.debug(e.stack);
    }
  }, this);
};

/**
 * @method createVenusCtx
 * @param {Venus} venus app context
 * @param {string} identifier
 */
PluginManager.prototype.createVenusCtx = function (venus, identifier) {
  var customCtx = ctx(venus);

  customCtx.info  = log(identifier, venus.config.colors, true);
  customCtx.debug = log(identifier, venus.config.colors, venus.config.debug);

  return customCtx;
};

/**
 * @method get
 * @param {string} plugin identifier
 */
PluginManager.prototype.get = function (plugin) {
  return this.instances[plugin];
};
