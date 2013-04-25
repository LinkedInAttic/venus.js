/**
 * Class for storing and restoring "venus-fixture-sandbox" HTML
 */
function FixtureHelper() {
  var FIXTURE_SANDBOX_ID = 'venus-fixture-sandbox';
  this.sandbox = this.getFixtureSandbox(FIXTURE_SANDBOX_ID);
  this.sandboxContents = this.sandbox ? this.sandbox.innerHTML : '';
}

/**
 * Fetches the html save ad the time of instantiation
 * @returns {String} The saved "venus-fixture-sandbox" html
 */
FixtureHelper.prototype.getFixtureContents = function() {
  return this.sandboxContents;
};

/**
 * Sets the innerHTML property of the "venus-fixture-sandbox"
 */
FixtureHelper.prototype.restoreState = function() {
  this.sandbox.innerHTML = this.sandboxContents;
};

/**
 * Gets the sandbox DOM node
 * @param {String} DOM id representing the "venus-fixture-sandbox"
 * @returns The sandbox DOM element or boolean false.
 */
FixtureHelper.prototype.getFixtureSandbox = function(id) {
  var el = document.getElementById(id);
  if (el) {
    return el;
  }
  return false;
};
