'use strict';

var log = require('./log');

module.exports = VenusCtx;

/**
 * Venus context object, provided to all plugins
 * @constructor
 */
function VenusCtx(name, config, plugins) {
  var colorize = true;

  if (config.get('noColors')) {
    colorize = false;
  }

  this.info  = log.info(name, colorize);
  this.debug = log.debug(name, colorize);
  this.error = log.error(name, colorize);

  this.config = config;
  this.plugins = plugins;
}
