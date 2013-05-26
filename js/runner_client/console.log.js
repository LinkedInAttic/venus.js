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
(function() {
  var nativeLog = function () {};

  if(window.console) {
    nativeLog = console.log;
  } else {
    window.console = {};
  }

  console.log = function() {
    nativeLog.apply(console, arguments);
    window.parent.venus.log.apply(window.parent.venus, arguments);
  };

}());
