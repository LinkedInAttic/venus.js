/**
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
 */

/**
 * Responsible for storing and restoring "venus-fixture-sandbox" HTML
 */

/**
 * Creates a new fixture helper
 */
function FixtureHelper() {
  var FIXTURE_SANDBOX_ID = 'venus-fixture-sandbox';
  this.sandbox = this.getFixtureSandbox(FIXTURE_SANDBOX_ID);
  this.sandboxContents = this.sandbox ? this.sandbox.innerHTML : '';
}

/**
 * ### getFixtureContents
 * Fetches the html save at the time of instantiation
 * @method getFixtureContents
 * @return {String} The saved "venus-fixture-sandbox" html
 */
FixtureHelper.prototype.getFixtureContents = function() {
  return this.sandboxContents;
};

/**
 * ### restoreState
 * Sets the innerHTML property of the "venus-fixture-sandbox"
 * @method restoreState
 * @return {Void}
 */
FixtureHelper.prototype.restoreState = function() {
  if (window.parent.venus.fixtureReset) {
    this.sandbox.innerHTML = this.sandboxContents;
  }
};

/**
 * ### getFixtureSandbox
 * Gets the sandbox DOM node
 * @method getFixtureSandbox
 * @param {String} DOM id representing the "venus-fixture-sandbox"
 * @return {HTMLElement | Boolean} The sandbox DOM element or boolean false.
 */
FixtureHelper.prototype.getFixtureSandbox = function(id) {
  var el = document.getElementById(id);
  if (el) {
    return el;
  }
  return false;
};
