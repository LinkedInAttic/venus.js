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

/**
 * Communicates with the Venus Server
 *
 * @param {Object} config - the configuration options
 * @constructor
 */
function VenusClientLibrary(config) {
  this.config = config;
  this.socket = null;
}

/**
 * Sets up socket IO connection and sets up hot reload
 */
VenusClientLibrary.prototype.connect = function() {
  var config = this.config;

  // create a connection with the server
  this.socket = io.connect(config.host, { port: config.port });

  // when a file in the current test suite changes...
  this.socket.on('reload-test', function(testId) {
    // if the file that changed is the test that is currently on the browser page, reload the page
    if (testId === window.venus.testId) {
      console.log('reloading me');
      window.location.reload();
    }
  });
};

/**
 * Called when a test is done running
 *
 * @param {Object} results - the test results
 */
VenusClientLibrary.prototype.done = function(results) {
  var sandbox = document.getElementById('sandbox'),
      doneEl  = document.createElement('div');

  // decorate the test results with metadata
  results.userAgent = window.navigator.userAgent;
  results.codeCoverageData  = sandbox.contentWindow.__coverage__;
  results.testId = window.venus.testId;

  this.socket.emit('results', results);

  // append the test results to the document
  doneEl.id = 'test-done-marker';
  document.body.appendChild(doneEl);

  $(document).trigger('results', results);

  if (window.VenusTestList) {
    VenusTestList.postTestResults(results);
  }
};

/**
 * Forwards a console.log message to server
 */
VenusClientLibrary.prototype.log = function() {
  var str = Array.prototype.slice.call(arguments, 0).join(' ');

  // display on the Venus log
  this.socket.emit( 'console.log', str);
};

/**
 * Execute server side hook
 *
 * @returns {Promise}
 */
VenusClientLibrary.prototype.beforeHook = function() {
  var def = $.Deferred();

  this.socket.emit('execute:before:hook', { testId: window.venus.testId }, function () {
    def.resolve();
  });

  return def.promise();
};
