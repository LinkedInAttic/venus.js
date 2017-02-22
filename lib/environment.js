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
var configHelper = require('./config'),
    deferred     = require('deferred'),
    i18n         = require('./util/i18n'),
    logger       = require('./util/logger');

/**
 * Stores environment configuration values
 * @constructor
 * @param {Object} config   a venus configuration object
 * @param {string} envName  the name of the environment
 * @param {Object} reporter an object that conforms to venus' reporting API
 */
function Environment(config, envName, reporter) {
  this.config = config;
  this.envName = envName;
  this.reporter = reporter;
}

/**
 * Initialize this instance
 * @param {String} envName the environment name
 */
Environment.prototype.init = function () {
  this.envConfig = this.loadConfig(this.envName);
  return this;
};

/**
 * Load environment config
 * @param  {String} envName the environment name
 * @return {Object}         the environment config object
 */
Environment.prototype.loadConfig = function (envName) {
  var envConfig = this.config.get('environments', envName);

  if (!envConfig) {
    throw new Error('Environment ' + envName + ' not found.');
  }

  this.Uac = require('./uac/' + envConfig.uac);
  this.uac = new this.Uac(envConfig);
  return envConfig;
};

/**
 * Starts the environment
 * @param  {Object}  testgroup object containing tests (in tesgroup.testarray)
 * @return {Promise}           a promise that is resolved when all tests have completed execution
 */
Environment.prototype.start = function (testgroup) {
  var start = this.uac.start(),
      def   = deferred(),
      testRunCount = 0,
      testCount = testgroup.testArray.length;

  function onSuccess () {
    testRunCount++;

    if (testRunCount === testCount) {
      def.resolve();
    }
  }

  function onFail (err) {
    this.reporter.emit('error', err);

    testRunCount++;
    if (testRunCount === testCount) {
      def.resolve();
    }
  }

  this.pendingTests = testCount;

  start.then(function (uac) {
    testgroup.testArray.forEach(function (test) {
      test.copyDependenciesPromise.then(function () {
        uac.loadUrl(test.url.run).then(
          onSuccess,
          onFail.bind(this)
        );
      }.bind(this),
      function (err) {
        onFail.call(this, err);
        logger.error(i18n('Failed to load url %s due to the dependencies not being copied', test.url.run));
      }.bind(this));
    }.bind(this));
  }.bind(this),
  def.reject);

  return def.promise;
};

/**
 * Shuts down the environment
 * @return {Promise} a promise that is resolved when the user account control has finished its exit process
 */
Environment.prototype.shutdown = function () {
  return this.uac.stop();
};

/**
 * Create a new instance
 * @param  {Object} config a venus config object
 * @param  {String} envName the environment name
 * @param  {Object} reporter the test reporter
 * @return {Object} the environment instance
 */
function create(config, envName, reporter) {
  return new Environment(config, envName, reporter).init();
}

module.exports.Environment = Environment;
module.exports.create = create;
Object.seal(module.exports);
