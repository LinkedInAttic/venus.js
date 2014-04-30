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

var cp       = require('child_process'),
    deferred = require('deferred');

/**
 * Process Status helper
 * @constructor
 */
function Ps () {}

/**
 * Greps for a given value in the list of processes
 *
 * @param {string} grepValue - the value to grep for
 *
 * @returns {promise}
 */
Ps.prototype.grep = function (grepValue) {
  var def = deferred(),
      self = this;

  cp.exec('ps aux|grep ' + grepValue, function (err, stdout, stderr) {
    var error = err || stderr.toString('utf8');

    if (error) {
      def.reject(error);
    } else {
      def.resolve(self.parseOutput(stdout.toString('utf8').trim()));
    }
  });

  return def.promise;
};

/**
 * Kill each process via its pid
 *
 * @param {string[]} pids - an array of the pid's to kill
 *
 * @returns {promise}
 */
Ps.prototype.kill = function (pids) {
  var def = deferred(),
      cmd = [];

  if (!Array.isArray(pids)) {
    pids = [pids];
  }

  pids.forEach(function (pid) {
    if (process.pid.toString() !== pid) {
      cmd.push('kill -9 ' + pid);
    }
  });

  if (cmd.length > 0) {
    cp.exec(cmd.join(' && '), def.resolve);
  } else {
    def.resolve();
  }

  return def.promise;
};

/**
 * Splits an output string on every newline character and inserts each line into an array
 *
 * @param {string} output - the output
 *
 * @returns {string[]} - an array where each element is a line of the output
 */
Ps.prototype.parseOutput = function (output) {
  return output.split('\n').map(function (line) {
    return line.replace(/\s+/, ' ').split(' ')[1];
  });
};

module.exports = new Ps ();
Object.seal(module.exports);
