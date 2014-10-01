'use strict';

var Promise = require('bluebird');

module.exports = MyPlugin;

/**
 * @constructor
 * @param {object} ctx - VenusCtx object
 */
function MyPlugin(venus) {
  this.info = venus.info;
  this.debug = venus.debug;
  this.error = venus.error;
}

MyPlugin.prototype.name = 'MyPlugin';

MyPlugin.prototype.init = function () {
  this.info('init!');
};

MyPlugin.prototype.attach = function () {
  this.info('attach!');
};

MyPlugin.prototype.exit = function () {
  return new Promise(function (resolve, reject) {
    this.debug('exiting now...');
    setTimeout(function () {
      this.error('done shutting down');
      resolve();
    }.bind(this), 2000);
  }.bind(this));
};

MyPlugin.prototype.run = function () {
  return new Promise(function (resolve, reject) {
    this.info('run!');
    setTimeout(function () {
      this.info('done!');
      resolve();
    }.bind(this), 2000);
  }.bind(this));
};

