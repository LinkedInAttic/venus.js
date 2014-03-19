/*
 * Venus
 * Copyright 2014 LinkedIn
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
 *     express or implied. See the License for the specific language
 *     governing permissions and limitations under the License.
 **/
(function(window) {
  var nativeLog = function () {};

  // if console.log is natively defined in the browser, use the native implementation.
  // otherwise, use venusjs's implementation
  if (window.console) {
    nativeLog = window.console.log;
  } else {
    window.console = {};
  }

  console.log = function() {
    var parent = window.parent;

    // output to both the console.log (if natively implemented) and the venus log
    nativeLog.apply(console, arguments);
    parent.venus.log.apply(parent.venus, arguments);
  };
}(window));
