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

function Ps() {


}

Ps.prototype.grep = function (grepValue) {
  var def = deferred();

  cp.exec('ps aux|grep ' + grepValue, function (err, stdout, stderr) {
    stdout = stdout.toString('utf8');
    stderr = stderr.toString('utf8');

    if (err || stderr) {
      def.reject(stderr || err);
    } else {
      def.resolve(this.parseOutput(stdout.trim()));
    }
  }.bind(this));

  return def.promise;
};

Ps.prototype.kill = function (pids) {
  var def = deferred(), cmd = [];

  if (!Array.isArray(pids)) {
    pids = [pids];
  }

  pids.forEach(function (pid) {
    if (process.pid.toString() === pid) {
      return;
    }

    cmd.push('kill -9 ' + pid);
  });

  if (cmd.length > 0) {
    cp.exec(cmd.join(' && '), function (err, stdout, stderr) {
      stdout = stdout.toString('utf8');
      stderr = stderr.toString('utf8');
      def.resolve();
    }.bind(this));
  } else {
    def.resolve();
  }

  return def.promise;
};

Ps.prototype.parseOutput = function (output) {
  return output.split('\n').map(function (line) {
    return line.replace(/\s+/, ' ').split(' ')[1];
  });
};

module.exports = new Ps();
Object.seal(module.exports);
