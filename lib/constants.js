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

var os = require('os');

// Define constants for Venus application
var constants = {};

if (process.platform === 'win32') {
  constants.userHome = process.env['USERPROFILE'];
} else {
  constants.userHome = process.env['HOME'];
}

// Get the interface which is ip4 and not internal
constants.getInterface = function () {
  var eth0 = os.networkInterfaces().eth0,
      retVal;

  retVal = { address: '0.0.0.0', family: 'IPv4', internal: false };

  if (eth0) {
    eth0 = eth0.filter(function (item) {
      return item.internal === false && item.family === 'IPv4';
    });

    retVal = eth0[0];
  }

  return retVal;
};

constants.hostname = constants.getInterface().address;
constants.urlNamespace = '/venus-core';

module.exports = constants;
Object.seal(module.exports);
