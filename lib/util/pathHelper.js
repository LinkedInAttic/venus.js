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

// Path helpers  

var path   = require('path'),
    i18n   = require('./i18n'),
    logger = require('./logger'),
    _      = require('underscore');

// Constructor for PathHelper  
function PathHelper(path) {
  this.path = path;

  Object.defineProperties(this, {
    'file': {
      get: function() {
        var parts = this.path.split('/'),
            file = _.last(parts);

        if(file.length === 0) {
          file = parts[parts.length - 2] + '/';
        }

        return file;
      }
    }
  });
};

// Manipulate a path - move up N directories  
PathHelper.prototype.up = function() {
  var path = this.path.split('/');
  path.pop(1);
  this.path = path.join('/');
  return this;
};

// To string function  
PathHelper.prototype.toString = function() {
  return this.path;
};

// Constructor helper
function createPathHelper(path) {
  return new PathHelper(path);
};

module.exports = createPathHelper;
Object.seal(module.exports);
