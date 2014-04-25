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

var os = require('os'),
    constants;

/**
 * Define constants for Venus application
 */
constants = {
  userHome : (process.platform === 'win32') ? process.env['USERPROFILE'] : process.env['HOME'],

  /**
   * Get the interface which is ip4 and not internal
   *
   * @returns {{address: string, family: string, internal: boolean}}
   */
  getInterface : function () {
    var eth0 = os.networkInterfaces().eth0,
        retVal = {
          address: '127.0.0.1',
          family: 'IPv4',
          internal: false
        };

    if (eth0) {
      eth0 = eth0.filter(function(item) {
        return !item.internal && item.family === 'IPv4';
      });

      retVal = eth0[0];
    }

    return retVal;
  },

  urlNamespace : '/venus-core'
};

constants.hostname = constants.getInterface().address;

module.exports = constants;
Object.seal(module.exports);
