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
    configHelper = require('./config'),
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
function TestCase() {
}

// Initialize
TestCase.prototype.init = function(path, id, runUrl, instrumentCodeCoverage, hotReload) {
  this.path                   = path;
  this.id                     = id;
  this.url                    = { run: runUrl };
  this.instrumentCodeCoverage = instrumentCodeCoverage;
  this.hotReload              = hotReload;
  this.load();
};

TestCase.prototype.load = function () {
  var testData  = this.parseTestFile(this.path);

  this.src                    = testData.src;
  this.directory              = testData.directory;
  this.hasAnnotations         = this.countVenusAnnotations(testData.annotations) > 0;
  this.annotations            = this.resolveAnnotations(testData.annotations);

  this.harnessTemplate        = this.loadHarnessTemplate(this.annotations);
  this.includes               = this.prepareIncludes(this.annotations);
  this.url.includes           = this.copyFilesToHttpPath(this.includes).urls;

  if (this.watcher) {
    this.watcher.close();
  }

  if (this.hotReload) {
    this.watchFiles(this.includes.map(function (include) {
      return include.fs;
    }));
  }

};

TestCase.prototype.countVenusAnnotations = function (annotations) {
  var count = 0;

  Object.keys(annotations).forEach(function (annotation) {
    if (annotation.indexOf('venus') === 0) {
      count++;
    }
  });

  return count;

};

// Watch files
TestCase.prototype.watchFiles = function (files) {
  var watcher = this.watcher = require('chokidar').watch(files, {persistent: true});

  watcher.on('change', function (filePath) {
    logger.info('File ' + filePath + ' has changed, reloading test ' + this.id);
    this.load();
  }.bind(this));

  files.forEach(function (file) {
    watcher.add(file);
  });

  if (this.fixturePath) {
    watcher.add(this.fixturePath);
  }
};


// Resolve annotations
// Use default values for missing annotations
TestCase.prototype.resolveAnnotations = function(annotations) {
  var conf  =  this.config,
      library = annotations[annotation.VENUS_LIBRARY],
      include = annotations[annotation.VENUS_INCLUDE],
      groups = annotations[annotation.VENUS_INCLUDE_GROUP],
      fixture = annotations[annotation.VENUS_FIXTURE],
      fixturePath;

  if ( !library ) {
    library = conf.default.library;
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
      fixturePath = this.fixturePath = pathm.resolve( this.directory, fixture );

      try {
        fixture = fs.readFileSync(fixturePath).toString();
      } catch(e) {
        fixture = configHelper.loadTemplate(fixture);
      }

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
  includes = config.get('libraries', library, 'includes');

  // Add default includes
  // I dont understand these configurations. What do they do?????
  if (config.includes && config.includes.default) {
    includes = includes.concat(config.includes.default);
  }


  // Add include group files
  includeGroups.forEach(function (groupName) {
    if (config.includes) {
      group = config.includes[groupName];
      if (group) {
        includes = includes.concat(group);
      }
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
    var prepend  = '',
        parts,
        basePath;

    parts = filePath.split('/');
    basePath = config.get('basePaths', parts[0]);

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
      // var symMkdirPath = path.http.replace(/\/(?:.(?!\/))+$/, '');
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
        fstools.copy(path.fs, path.http, function(err) {
          if (err) {
            logger.debug(i18n('Error copying test file %s to %s. Exception: %s', path.fs, path.http, err));
          }
        });
      }
    }, this);

    return { urls: urls};
};

// Load test harness template
TestCase.prototype.loadHarnessTemplate = function(annotations) {
  var harnessName = annotations[annotation.VENUS_TEMPLATE];

  // If harness is specified in config, then get that harness
  // file
  if (harnessName) {
    return configHelper.loadTemplate(harnessName);
  } else {
    return configHelper.loadTemplate('sandbox');
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

/**
 * Create a new TestCase object
 *
 * @param {object} config - Configuration object.
 * {
 *  'config': Mandatory. Config file to use for this test
 *  'path': Mandatory. Path to the file that we are going to test
 *  'id': Mandatory. Id of the test
 *  'runUrl': Mandatory. Url that will be used to run this test
 *  'instrumentCodeCoverate': Boolean. True to enable code coverage
 * }
 *
 * @returns {object} instance - Instance of TestCase
 */
function create(config) {
  var instance = new TestCase();
  instance.config = config.config;
  instance.init(config.path, config.id, config.runUrl, config.instrumentCodeCoverage, config.hotReload);
  return instance;
}

/**
 * Parse a test file to see if it has annotations
 * @param {string} testPath - path to test file on disk
 * @returns {boolean}
 */
function hasAnnotations(testPath) {
  var test     = new TestCase(),
      testData = test.parseTestFile(testPath);

  return test.countVenusAnnotations(testData.annotations) > 0;
}


module.exports.TestCase = TestCase;
module.exports.create = create;
module.exports.annotation = annotation;
module.exports.hasAnnotations = hasAnnotations;
Object.seal(module.exports);
