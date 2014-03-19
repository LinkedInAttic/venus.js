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
var util = require('util'),
    Base = require('./BaseReporter'),
    base = new Base();

/**
 * Tests reporter
 */
function DotReporter() {
  Base.call(this);
}

// We want to listen for events
util.inherits(DotReporter, Base);

/**
 * Prints a green dot
 *
 * @param {string} message - Test message
 */
DotReporter.prototype.onPass = function (message) {
  base.onPass.call(this, message);
  process.stdout.write('.'.green);
};

/**
 * Prints a red F
 *
 * @param {string} message - Test message
 */
DotReporter.prototype.onFail = function (message, stackTrace) {
  base.onFail.call(this, message, stackTrace);
  process.stdout.write('F'.red);
};

/**
 * Prints all failures
 */
DotReporter.prototype.onEnd = function () {
  console.log('\n');
  base.onEnd.call(this);
};

module.exports = DotReporter;
