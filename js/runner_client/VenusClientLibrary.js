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
 */
function VenusClientLibrary( config ){
  this.config = config;
  this.socket = null;
}

/**
 * Sets up socket IO connection
 */
VenusClientLibrary.prototype.connect = function(){
  var config = this.config;

  this.socket = io.connect(
    config.host,
    { port: config.port }
  );
};

/**
 * Called when test is done running
 * @param {Object} results the test results
 */
VenusClientLibrary.prototype.done = function( results ){
  var sandbox = document.getElementById('sandbox'),
      doneEl  = document.createElement('div');

  results.userAgent = window.navigator.userAgent;
  results.codeCoverageData  = sandbox.contentWindow.__coverage__;
  this.socket.emit( 'results', results );

  doneEl.id = 'test-done-marker';
  document.body.appendChild(doneEl);
};

/**
 * Forward a console.log message to server
 * @param {String} str the log message
 */
VenusClientLibrary.prototype.log = function () {
  var str = Array.prototype.slice.call(arguments, 0).join(' ');
  this.socket.emit( 'console.log', str);
};
