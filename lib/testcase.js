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
    when         = require('when'),
    comments     = require('./util/commentsParser'),
    pathHelper   = require('./util/pathHelper'),
    logger       = require('./util/logger'),
    i18n         = require('./util/i18n'),
    constants    = require('./constants'),
    deferred     = require('deferred'),
    pathm        = require('path'),
    configHelper = require('./config'),
    fstools      = require('fs-tools'),
    stringUtil   = require('./util/stringUtil'),
    mkdirp       = require('mkdirp'),
    events       = require('events'),
    util         = require('util'),
    Instrumenter = require('istanbul').Instrumenter,
    annotation   = {
      VENUS_FIXTURE: 'venus-fixture',
      VENUS_FIXTURE_RESET: 'venus-fixture-reset',
      VENUS_INCLUDE: 'venus-include',
      VENUS_CODE: 'venus-code',
      VENUS_RESOURCE: 'venus-resource',
      VENUS_POST: 'venus-post',
      VENUS_PRE: 'venus-pre',
      VENUS_INCLUDE_GROUP: 'venus-include-group',
      VENUS_LIBRARY: 'venus-library',
      VENUS_TEMPLATE: 'venus-template',
      VENUS_TYPE: 'venus-type',
      VENUS_EXECUTE: 'venus-execute'
    };

/**
 * Constructor
 * @constructor
 */
function TestCase() {}

util.inherits(TestCase, events.EventEmitter);

/**
 * Initializes TestCase instance
 * @param  {String}    path                   path to the test
 * @param  {Number}    id                     the test's ID
 * @param  {String}    runUrl                 the test's run URL (where it can be accessed via browser)
 * @param  {String}    runPath                the test's runtime location (where it is served by express)
 * @param  {Boolean}   instrumentCodeCoverage True to enable code coverage
 * @param  {Boolean}   hotReload              Uses hot reload if true
 * @return {Undefined}                        Undefined
 */
TestCase.prototype.init = function(path, id, runUrl, runPath, instrumentCodeCoverage, hotReload) {
  this.path                   = path;
  this.id                     = id;
  this.url                    = { run: runUrl, path: runPath };
  this.instrumentCodeCoverage = instrumentCodeCoverage;
  this.hotReload              = hotReload;
  this.load();
};

/**
 * Loads Venus information from test file
 * @return {Undefined} Undefined
 */
TestCase.prototype.load = function () {
  var testData  = this.parseTestFile(this.path),
      urls      = [];

  this.src                    = testData.src;
  this.directory              = testData.directory;
  this.hasAnnotations         = this.countVenusAnnotations(testData.annotations) > 0;
  this.annotations            = this.resolveAnnotations(testData.annotations);

  this.harnessTemplate        = this.loadHarnessTemplate(this.annotations);
  this.includes               = this.prepareIncludes(this.annotations);
  this.executeScripts         = this.prepareExecuteScripts(this.annotations);
  this.resources              = this.prepareResources(this.annotations);
  this.copyDependenciesPromise = this.copyFilesToHttpPath(this.includes);

  this.includes.forEach(function (path) {
    urls.push(path.url);
  });

  this.url.includes = urls;

  if (this.watcher) {
    this.watcher.close();
  }

  if (this.hotReload) {
    this.watchFiles(this.includes.map(function (include) {
      return include.fs;
    }));
  }

};

/**
 * Counts the number of Venus annotations in a file
 * @param  {Object} annotations an object containing properties with keys equal to annotations (comment statements beginning with @venus)
 * @return {Number}             the number of Venus annotations contained in the annotations object
 */
TestCase.prototype.countVenusAnnotations = function (annotations) {
  var count = 0;

  Object.keys(annotations).forEach(function (annotation) {
    if (annotation.indexOf('venus') === 0) {
      count++;
    }
  });

  return count;

};

/**
 * Watch files for changes
 * @param  {Array}     files an array of filepaths to watch
 * @return {Undefined}       Undefined
 */
TestCase.prototype.watchFiles = function (files) {
  var watcher = this.watcher = require('chokidar').watch(files, {persistent: true});

  watcher.on('change', function (filePath) {
    logger.info('File ' + filePath + ' has changed, reloading test ' + this.id);
    this.load();
    this.emit('reload', this);
  }.bind(this));

  files.forEach(function (file) {
    watcher.add(file);
  });

  if (this.fixturePath) {
    watcher.add(this.fixturePath);
  }
};


/**
 * Resolves annotations
 * @param  {Object} annotations an object parsed from annotations contained in this testcase's test file
 * @return {Object}             resolved annotations
 */
TestCase.prototype.resolveAnnotations = function(annotations) {
  var conf         = this.config,
      library      = annotations[annotation.VENUS_LIBRARY],
      include      = annotations[annotation.VENUS_INCLUDE],
      groups       = annotations[annotation.VENUS_INCLUDE_GROUP],
      fixture      = annotations[annotation.VENUS_FIXTURE],
      execute      = annotations[annotation.VENUS_EXECUTE],
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

  // Execute scripts.
  // These are executed server side before and after running tests in browser.
  if (!execute) {
    execute = [];
  } else if (!Array.isArray(execute)) {
    execute = [execute];
  }

  annotations[annotation.VENUS_EXECUTE] = execute;


  return annotations;
};

/**
 * Get the path on the filesystem for the temporary folder for this test includes
 * @param {Number} testId the id of this testcase
 */
TestCase.prototype.getHttpRoot = function (testId) {
  return pathm.resolve(constants.userHome, '.venus_temp', 'test', testId.toString());
};


/**
 * Prepare testcase includes - there are the files to be included on the test fixture page in the browser
 * @param  {Object} annotations annotations object containing arrays of annotations
 * @return {Array}              An array of filemappings that maps source files to files served from the temp location during test execution.
 */
TestCase.prototype.prepareIncludes = function (annotations) {
  var self = this,
      library = annotations[annotation.VENUS_LIBRARY],
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
      errorMessage,
      fileMappings = [],
      includeFiles = annotations[annotation.VENUS_INCLUDE],
      sourceCodeFiles = annotations[annotation.VENUS_CODE] || [],
      includeGroups = annotations[annotation.VENUS_INCLUDE_GROUP];

  includeFiles = includeFiles.concat(sourceCodeFiles);
  httpRoot = this.getHttpRoot(testId);
  httpResourceUrls = [];

  // Add library files
  includes = config.get('libraries', library, 'includes') || [];

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
        basePath,
        rawFilePath = filePath;

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
      } else if (part === '.') {
        prepend += '';
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

    if(!fs.existsSync(filePath)) {
      if(!includes.errors) {
        includes.errors = [];
      }
      includes.errors.push(parts.join('/'));
      return;
    }


    //This could be more succinct
    if (sourceCodeFiles.indexOf(rawFilePath) !== -1) {
      includes.push({ prepend: prepend, path: filePath, httpDir: 'includes', instrumentable: true });
    } else {
      includes.push({ prepend: prepend, path: filePath, httpDir: 'includes', instrumentable: false });
    }
  }, this);

  if(includes.errors && includes.errors.length > 0) {
    errorMessage = self.path.split('/').pop() + ': Includes specified in your annotations could not be found\n';
    includes.errors.forEach(function(error) {
      errorMessage += ' - ' + error + '\n';
    });
    logger.error(i18n(errorMessage));
    process.exit(1);
  }


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

/**
 * Prepares the code under test (the code to be executed) identified by @venus-execute annotations
 * @param  {Object} annotations the annotations object parsed from annotations contained in this testcase's test file
 * @return {Array}              an array of require-loaded modules
 */
TestCase.prototype.prepareExecuteScripts = function (annotations) {
  var scripts, modules;

  scripts = annotations[annotation.VENUS_EXECUTE];
  modules = [];

  scripts.forEach(function (script) {
    var scriptPath, module;

    scriptPath = pathm.resolve(this.directory, script);

    try {
      module     = require(scriptPath);
      modules.push(module);
    } catch (e) {
      // Debug: unable to load module
    }

  }, this);

  return modules;
};

/**
 * Executes hook functions
 * @param  {String}  hook the name of the hook function to execute
 * @return {Promise}      a promise that resolves when all script hook functions have resolved
 */
TestCase.prototype.executeHook = function (hook) {
  var ctx      = this.executeContext(),
      promises = [],
      hookArgs = Array.prototype.slice.call(arguments, 1);

  this.executeScripts.forEach(function (script) {
    var result;
    if (typeof script[hook] === 'function') {
      result = script[hook].apply(this, [ctx].concat(hookArgs));

      if (result && typeof result.then === 'function') {
        promises.push(result);
      }

    }
  }, this);

  if (promises.length === 0) {
    return when.defer().resolve();
  } else {
    return when.all(promises);
  }
};

/**
 * Build the execute context, which is passed to executeHook
 * @return {Object} executionContext including testPath and testId properties
 */
TestCase.prototype.executeContext = function () {
  return {
    testPath: this.path,
    testId: this.id
  };
};


/**
 * Prepare testcase resources
 * There are external resources that are accessible within the sandbox
 * These are included via @venus-resource annotation
 * @param  {Object} annotations an object containing properties with keys equal to annotations (comment statements beginning with @venus)
 * @return {Array}              An array of filemappings that maps source files to files served from the temp location during test execution.
 */
TestCase.prototype.prepareResources = function (annotations) {
  var testId        = this.id,
      config        = this.config,
      httpRoot      = this.getHttpRoot(testId),
      resourceFiles = annotations[annotation.VENUS_RESOURCE] || [],
      resources     = [],
      fileMappings  = [];

  // Make sure to put all resources in an array
  if (!Array.isArray(resourceFiles)) {
    resourceFiles = [resourceFiles];
  }

  // For each resource, determine the following:
  // - prepend         [characters to prepend resource name]
  // - path            [path to resource on file system]
  // - httpDir         [name of directory to put resource in so it's accessible via http]
  // - instrumentable  [whether or not to apply code coverage to resource]
  resourceFiles.forEach(function (filePath) {
    var prepend  = '',
        parts,
        basePath,
        rawFilePath = filePath;

    parts = filePath.split('/');
    basePath = config.get('basePaths', parts[0]);

    // Base path exists in config file
    if (basePath) {
      parts[0] = basePath;
      filePath = parts.join('/');
    }

    // For each part of the path, determine prepend
    parts.forEach(function (part, index) {
      if (index === parts.length - 1) {
        return;
      }

      if ((part === '..') || (part === '.')) {
        prepend += '';
      } else if (part) {
        prepend += part + '/';
      }
    });

    // if path doesn't begin with a '/' character, we assume it
    // is relative and needs to be resolved relative
    // to the directory the testcase file lives in
    if (filePath[0] !== '/') {
      filePath = pathm.resolve(this.directory + '/' + filePath);
    }

    // Add to resources array
    resources.push({ prepend: prepend, path: filePath, httpDir: 'resources', instrumentable: false});
  }, this);

  // Take list of resources and copy them to a temporary location
  // on the server. The path is {venus install location}/temp/test/{testid}/resources
  resources.forEach(function (resource) {
    var filePath       = resource.path,
        httpDir        = resource.httpDir,
        destination    = pathm.resolve(httpRoot + '/' + httpDir + '/' + resource.prepend + pathHelper(filePath).file),
        httpUrl        = '/' + destination.substr(destination.indexOf('temp/test/' + testId)),
        instrumentable = resource.instrumentable;

    // Add to list of file mappings
    //  fs   = original file path on disk
    //  http = relative http path to file on server
    fileMappings.push({
      fs: filePath,
      http: destination,
      url: httpUrl,
      instrumentable: instrumentable
    });

    // Add resource to http path
    fstools.copy(filePath, destination, function(err) {
      if (err) {
        logger.debug(i18n('Error copying test file %s to %s. Exception: %s', filePath, destination, err));
      }
    });
  });

  return fileMappings;
};

/**
 * Copy dependencies to http root temp location for serving tests via http
 * @param  {Array} files an array of strings containing filepaths to be copied
 * @return {Function}   A promise which get's resolved once all files get copied.
 */
TestCase.prototype.copyFilesToHttpPath = function (files) {
    var filesCopiedDeferredObj = deferred(),
        dependenciesLoaded = 0,
        totalDependencies = files.length,
        instrumenter;

    function onSuccess() {
      if (totalDependencies === ++dependenciesLoaded) {
        filesCopiedDeferredObj.resolve();
      }
    }

    function onFail(err) {
      filesCopiedDeferredObj.reject(err);
    }

    files.forEach(function (path) {
      var promise;

      // Copy everything to http location; treat as "build" path
      fstools.copy(path.fs, path.http, function(err) {
        if (err) {
          logger.debug(i18n('Error copying test file %s to %s. Exception: %s', fs, path.http, err));
          onFail(err);
        }

        // Instrumentable code considered "source" code; can be transformed
        if (path.instrumentable) {
          promise = this.executeHook('transform', path.http);

          // only instrument file for code coverage if option is enabled and file is an @venus-include
          if (this.instrumentCodeCoverage) {
            // instrument the file with istanbul
            promise.then(function () {
              instrumenter = new Instrumenter({
                preserveComments: true,
                noCompact: true,
                embedSource: true,
                noAutoWrap: true
              });

              fs.readFile(path.http, function (err, data) {
                if (err) {
                  onFail(err);
                  return;
                }

                instrumenter.instrument(data.toString(), path.http, function (err, code) {
                  // Kind of hacky, need to make sure directory exists before writing
                  // TODO: clean this up
                  var p = path.http.split('/').slice(0, -1).join('/');
                  mkdirp(p, function () {
                    fs.writeFile(path.http, code, function (err) {
                      if (err) {
                        logger.error('Unable to write file: ' + path.http);
                        onFail(err);
                      }
                      onSuccess();
                    });
                  });
                });
              });
            }, function(err) {
              onFail(err);
            });
          } else {
            onSuccess();
          }
        } else {
          onSuccess();
        }
      }.bind(this));

    }.bind(this), this);

    return filesCopiedDeferredObj.promise;
};

/**
 * Load harness template
 * @param  {Object} annotations an object containing properties with keys equal to annotations (comment statements beginning with @venus)
 * @return {String}             template contents
 */
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

/**
 * Parse a TestCase file
 * @param  {String} file the path to the TestCase file
 * @return {Object}      an object containing test file properties
 * {
 *   'path': The path to the TestCase file,
 *   'directory': The directory containing this file,
 *   'src': The file contents,
 *   'annotations': The @venus- annotations contained in the file
 * }
 */
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
 * @param {Object} config Configuration object.
 * {
 *  'config': Mandatory. Config file to use for this test
 *  'path': Mandatory. Path to the file that we are going to test
 *  'id': Mandatory. Id of the test
 *  'runUrl': Mandatory. Url that will be used to run this test
 *  'instrumentCodeCoverate': Boolean. True to enable code coverage
 * }
 *
 * @returns {Object} instance Instance of TestCase
 */
function create(config) {
  var instance = new TestCase();
  instance.config = config.config;
  instance.init(config.path, config.id, config.runUrl, config.runPath, config.instrumentCodeCoverage, config.hotReload);
  return instance;
}

/**
 * Parse a test file to see if it has annotations
 * @param   {String}  testPath - path to test file on disk
 * @returns {Boolean}
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
