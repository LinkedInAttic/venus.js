/*
 * Venus
 * Copyright 2013 LinkedIn
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing,
 *     software distributed under the License is distributed on an "AS
 *     IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *     express or implied.   See the License for the specific language
 *     governing permissions and limitations under the License.
 **/

// Manages a Venus Environment

'use strict';
var configHelper = require('./config');

/**
 * Constructor
 * @constructor
 */
function Environment(config, envName) {
  this.config = config;
  this.envName = envName;
}

/**
 * Initialize this instance
 * @param {string} envName the environment name
 */
Environment.prototype.init = function () {
  this.envConfig = this.loadConfig(this.envName);
  return this;
};

/**
 * Load environment config
 * @param {string} envName the environment name
 * @return {object} the environment config object
 */
Environment.prototype.loadConfig = function (envName) {
  var envConfig = this.config.get('environments', envName);

  if (!envConfig) {
    throw new Error('Environment ' + envName + ' not found.');
  }

  this.uac = require('./uac/' + envConfig.uac);
  return envConfig;
};

/**
 * Create a new instance
 * @param {object} config a venus config object
 * @param {string} envName the environment name
 * @return {object} the environment instance
 */
function create(config, envName) {
  return new Environment(config, envName).init();
}

module.exports.Environment = Environment;
module.exports.create = create;
Object.seal(module.exports);
