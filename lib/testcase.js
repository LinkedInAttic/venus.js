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

// Represents a single testcase file

'use strict';
var fs           = require('fs'),
    comments     = require('./util/commentsParser'),
    pathHelper   = require('./util/pathHelper'),
    logger       = require('./util/logger'),
    i18n         = require('./util/i18n'),
    constants    = require('./constants'),
    pathm        = require('path'),
    config       = require('./config'),
    fstools      = require('fs-tools'),
    stringUtil   = require('./util/stringUtil'),
    mkdirp       = require('mkdirp'),
    Instrumenter = require('istanbul').Instrumenter,
    annotation   = {
      VENUS_FIXTURE: 'venus-fixture',
      VENUS_INCLUDE: 'venus-include',
      VENUS_POST: 'venus-post',
      VENUS_PRE: 'venus-pre',
      VENUS_INCLUDE_GROUP: 'venus-include-group',
      VENUS_LIBRARY: 'venus-library',
      VENUS_TEMPLATE: 'venus-template',
      VENUS_TYPE: 'venus-type'
    };

// Constructor for TestCase
function TestCase(conf) {
  this.config = conf || config.instance();
}

// Initialize
TestCase.prototype.init = function(path, id, runUrl, instrumentCodeCoverage) {
  var testData  = this.parseTestFile(path);

  this.src                    = testData.src;
  this.path                   = testData.path;
  this.directory              = testData.directory;
  this.hasAnnotations         = Object.keys(testData.annotations).length > 0;
  this.annotations            = this.resolveAnnotations(testData.annotations);
  this.id                     = id;
  this.url                    = { run: runUrl };
  this.instrumentCodeCoverage = instrumentCodeCoverage;

  this.harnessTemplate        = this.loadHarnessTemplate(this.annotations);
  this.url.includes           = this.copyFilesToHttpPath(
                                  this.prepareIncludes(this.annotations)
                                ).urls;
};

// Resolve annotations
// Use default values for missing annotations
TestCase.prototype.resolveAnnotations = function(annotations) {
  var config  =  this.config,
      library = annotations[annotation.VENUS_LIBRARY],
      include = annotations[annotation.VENUS_INCLUDE],
      groups = annotations[annotation.VENUS_INCLUDE_GROUP],
      fixture = annotations[annotation.VENUS_FIXTURE];

  if ( !library ) {
    library = config.get('default.library').value;
    if (!library) {
      throw {
        name: 'LibraryException',
        message: 'The default library is not defined in .venus/config'
      };
    }
  } else if ( Array.isArray(library) ) {
    library = library[0];
  }

  annotations[annotation.VENUS_LIBRARY] = library;

  if ( !include ) {
    include = [];
  } else if ( !Array.isArray(include) ) {
    include = [include];
  }

  annotations[annotation.VENUS_INCLUDE] = include;

  if ( !groups ) {
    groups = [];
  } else if ( !Array.isArray(groups) ) {
    groups = [groups];
  }

  annotations[annotation.VENUS_INCLUDE_GROUP] = groups;

  // If the fixture is not HTML, attempt to load the file:
  // 1. Look for file at path relative to path of testcase file
  // 2. If this fails, try to load as template from config directory
  // 3. If this fails, use an empty string
  if (!fixture) {
    fixture = '';
  } else {
    if (!stringUtil.hasHtml(fixture)) {
      var fixturePath = pathm.resolve( this.directory, fixture );

      try {
        fixture = fs.readFileSync(fixturePath).toString();
      } catch(e) {
        fixture = config.loadTemplate(fixture);
      }

      //fixture = config.loadTemplate(fixture);
      if (!fixture || !fixture.length) {
        fixture = '';
      }
    }
  }

  annotations[annotation.VENUS_FIXTURE] = fixture;

  return annotations;
};

/**
 * Get the path on the filesystem for the temporary folder for this test includes
 * @param {Number} testId the id of this testcase
 */
TestCase.prototype.getHttpRoot = function (testId) {
  return pathm.resolve(constants.userHome, '.venus_temp', 'test', testId.toString());
};

// Prepare testcase includes - there are the files
// to be included on the test fixture page in the browser
TestCase.prototype.prepareIncludes = function (annotations) {
  var library = annotations[annotation.VENUS_LIBRARY],
      testId = this.id,
      config  = this.config,
      libraryFile,
      adaptorFile,
      httpRoot,
      httpResourceUrls,
      libDest,
      group,
      adaptorDest,
      includes = [],
      fileMappings = [],
      includeFiles = annotations[annotation.VENUS_INCLUDE],
      includeGroups = annotations[annotation.VENUS_INCLUDE_GROUP];

  httpRoot = this.getHttpRoot(testId);
  httpResourceUrls = [];

  // Add library files
  includes = config.resolve('libraries.' + library + '.includes');

  // Add default includes
  if (config.resolve('includes') && config.resolve('includes.default')) {
    includes = includes.concat(config.resolve('includes.default'));
  }

  // Add include group files
  includeGroups.forEach(function (groupName) {
    group = config.resolve('includes.' + groupName);
    if (group) {
      includes = includes.concat(group);
    }
  }, this);

  if (!includes) {
    includes = [];
  }

  if (!Array.isArray(includes)) {
    includes = [includes];
  }

  includes = includes.map(function (include) {
    return { path: include, httpDir: 'lib', prepend: '' };
  });

  // Add files specified with @venus-include annotations
  includeFiles.forEach(function (filePath) {
    var filename = pathHelper(filePath).file,
        prepend  = '',
        parts,
        basePath;

    parts = filePath.split('/');
    basePath = config.resolve('basePaths.' + parts[0]);

    if (basePath) {
      parts[0] = basePath;
      filePath = parts.join('/');
    }

    parts.forEach(function (part, index) {
      if (index === parts.length - 1) {
        return;
      }

      if (part === '..') {
        prepend += '_.';
      } else if (part) {
        prepend += part + '.';
      }
    });

    // if path doesn't begin with a '/' character, we assume it
    // is relative and needs to be resolved relative
    // to the directory the testcase file lives in
    if (filePath[0] !== '/') {
      filePath = pathm.resolve(this.directory + '/' + filePath);
    }

    includes.push({ prepend: prepend, path: filePath, httpDir: 'includes', instrumentable: true });
  }, this);

  // Add the testcase file
  includes.push({ path: this.path, httpDir: 'test', prepend: '' });

  // Take list of files to be included and copy them to a temporary location
  // on the server. The path is {venus install location}/temp/test/{testid}/includes
  includes.forEach(function (include) {
    var filePath       = include.path,
        httpDir        = include.httpDir,
        destination    = pathm.resolve(httpRoot + '/' + httpDir + '/' + include.prepend + pathHelper(filePath).file),
        httpUrl        = '/' + destination.substr(destination.indexOf('temp/test/' + testId)),
        instrumentable = include.instrumentable;

    // Add to list of file mappings
    //  fs   = original file path on disk
    //  http = relative http path to file on server
    fileMappings.push({
      fs: filePath,
      http: destination,
      url: httpUrl,
      instrumentable: instrumentable
    });

  });

  return fileMappings;
};

// Copy dependencies to http root
TestCase.prototype.copyFilesToHttpPath = function (files) {
    var urls = [], instrumenter;

    files.forEach(function (path) {
      urls.push(path.url);

      // only instrument file for code coverage if option is enabled and file is an @venus-include
      if (this.instrumentCodeCoverage && path.instrumentable) {
        // instrument the file with istanbul
        instrumenter = new Instrumenter();

        fs.readFile(path.fs, function (err, data) {
          if (err) {
            return;
          }

          instrumenter.instrument(data.toString(), path.fs, function (err, code) {
            // Kind of hacky, need to make sure directory exists before writing
            // TODO: clean this up
            var p = path.http.split('/').slice(0, -1).join('/');
            mkdirp(p, function () {
              fs.writeFile(path.http, code, function (err) {
                if (err) {
                  logger.error('Unable to write file: ' + path.http);
                }
              });
            });
          });
        });
      } else {
        // simply copy the file
        fstools.copy(path.fs, path.http, function(err) {
          if (err) {
            logger.error(i18n('Error copying test file %s to %s. Exception: %s', path.fs, path.http, err));
          }
        });
      }
    }, this);

    return { urls: urls};
};

// Load test harness template
TestCase.prototype.loadHarnessTemplate = function(annotations) {
  var harnessFilePath,
      harnessName = annotations[annotation.VENUS_TEMPLATE],
      config = this.config,
      src;

  // If harness is specified in config, then get that harness
  // file
  if (harnessName) {
    return config.loadTemplate(harnessName);
  } else {
    return config.loadTemplate('sandbox');
  }
};

// Parse a test case file
TestCase.prototype.parseTestFile = function(file) {
  var fileContents = fs.readFileSync(file).toString();

  return {
    path     : file,
    directory: pathm.resolve( file.split('/').slice(0, -1).join('/') ),
    src      : fileContents,
    annotations : comments.parseStr(fileContents)
  };
};

// Create a new TestCase object
function create(path, id, runUrl, instrumentCodeCoverage) {
  var instance = new TestCase();
  instance.init(path, id, runUrl, instrumentCodeCoverage);
  return instance;
};

module.exports.TestCase = TestCase;
module.exports.create = create;
module.exports.annotation = annotation;
Object.seal(module.exports);
