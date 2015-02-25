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

// Test executor that is responsible for serving test content and instantiating clients to run tests

'use strict';
var PORT         = 2013,
    express      = require('express'),
    http         = require('http'),
    i18n         = require('./util/i18n'),
    logger       = require('./util/logger'),
    consolidate  = require('consolidate'),
    portscanner  = require('portscanner'),
    fs           = require('fs'),
    pathm        = require('path'),
    ioserver     = require('socket.io'),
    testcase     = require('./testcase'),
    testrun      = require('./testrun'),
    _            = require('underscore'),
    _s           = require('underscore.string'),
    dust         = require('dustjs-linkedin'),
    configHelper = require('./config'),
    fstools      = require('fs-tools'),
    ua           = require('useragent-parser'),
    coverage     = require('./coverage'),
    constants    = require('./constants'),
    environment  = require('./environment'),
    deferred     = require('deferred');

// Constructor for Executor
function Executor(cwd) {
  this.testId                 = 1;
  this.env                    = null;
  this.port                   = null;
  this.socket                 = null;
  this.config                 = configHelper.getConfig(cwd);
  this.urlNamespace           = this.config.urlNamespace || constants.urlNamespace;
  this.hostname               = constants.hostname;
  this.requireTestAnnotations = true;
  this.reporter               = null;
  this.startTime              = null;
  this.endTime                = null;
  this.logger                 = logger;
}

// Initialize
Executor.prototype.init = function(options, onStart) {
  var testgroup,
      staticContent,
      def = deferred();

  // set start time
  this.startTime = new Date();

  // set hostname if desired
  if (options.hostname) {
    this.hostname = options.hostname;
  } else if (this.config.hostname) {
    this.hostname = this.config.hostname;
  }

  // set code coverage flag
  this.enableCodeCoverage = options.coverage ? true : false;

  // set require annotations flag
  if (options.noAnnotations) {
    this.requireTestAnnotations = false;
  }

  // prepare static content
  staticContent = this.config.static;

  if(staticContent) {
    this.prepStaticContent(staticContent);
  }

  this.initEnvironment(options);


  this.initRoutes();

  this.start(this.port, onStart).then(function (port) {
    this.port = port;

    // Parse the list of relative paths specified in the command line arguments
    // in to an array of testcase objects.
    testgroup = this.testgroup = testrun.create(this.parseTests(options.test));

    // If no tests were selected to run, there is nothing to do.
    // log an error and return.
    // TODO: we may want to change this to throw an exception.
    if(testgroup.testCount === 0) {
      logger.error( i18n('No tests specified to run - exiting') );
      process.exit(1);
    }

    logger.info('Venus server started at http://' + this.hostname + ':' + this.port + ' and is serving ' + testgroup.testCount.toString().yellow + ' test files');

    // Print test URL
    if (testgroup.testCount <= 5) {
      testgroup.urls.forEach(function(url) {
        logger.info('Serving test: ' + url.run.yellow);
      });
    }

    // Create reporter
    this.reporter = this.setupReporter(options.reporter || this.config.reporter, options.outputFile);

    // Setup the selected environment
    if (options.environment) {
      process.nextTick(function () {
        logger.verbose(i18n('Using environment ' + options.environment));
        this.env = environment.create(testgroup.testArray[0].config, options.environment, this.reporter);
        this.env.start(testgroup).then(
          function () {
            this.env.shutdown().then(
              function () {
                this.shutdown();
              }.bind(this)
            );
          }.bind(this),

          function () {
            this.env.shutdown().then(
              function () {
                this.shutdown();
              }.bind(this)
            );
          }.bind(this)
        );
      }.bind(this));
    }

    this.reporter.emit('start', testgroup);

    def.resolve();

  }.bind(this));

  return def.promise;
};

/**
 * Setup the selected reporter
 */
Executor.prototype.setupReporter = function (reporter, outputFile) {
  var Reporter, reporterInstance;

  reporter = reporter || 'DefaultReporter';
  outputFile = outputFile || 'venus_results.txt';

  try {
    Reporter = require('./reporters/' + reporter);
    reporterInstance = new Reporter(outputFile);
  } catch (e) {
    throw new Error('Unable to instantiate selected reporter "' + reporter + '"');
  }

  return reporterInstance;
};

// Copy static content to temp folder
Executor.prototype.prepStaticContent = function(paths) {
  var fspath, httpRoot, httpPath;

  httpRoot = pathm.resolve(constants.userHome, '.venus_temp', 'static');

  // remove old static content
  fstools.remove(httpRoot, function () {
    fstools.mkdir(httpRoot, function () {

      Object.keys(paths).forEach(function (key) {
        fspath = paths[key];
        httpPath = pathm.resolve(httpRoot + '/' + key);

        // make the symlink to the file
        (function (fspath, httpPath) {
          // fstools.copy(fspath, httpPath, function (err) {

          fs.symlink(fspath, httpPath, function (err) {
            if (err) {
              logger.debug( i18n('error creating symlink for static path %s to %s. exception: %s', fspath, httpPath, err) );
            } else {
              logger.debug( i18n('created symlink for static path %s to %s', fspath, httpPath) );
            }
          });
        }(fspath, httpPath));
      });
    });
  });
};

// Start test runners!
Executor.prototype.runTests = function () {
  var i, len, uacs;

  this.throttle = 10;

  uacs = this.uacs;
  i = this.uacQueueIndex,
  len = Math.min(uacs.length, i + this.throttle);

  for (i; i < len; i++) {
    logger.info('Starting UAC ' + i);
    this.uacs[i].runTest();
  }

  this.uacQueueIndex = i;

  // this.uacs.forEach(function(runner) {
  // runner.runTest();
  // });
};

// Create UACs
Executor.prototype.createUacs = function(testgroup, env) {
  var uac, uacs, test;

  uacs = [];
  uac = env.uac;

  for(var i = 0; i < this.testgroup.testArray.length; i++) {
    test = this.testgroup.testArray[i];
    uacs.push(uac.create(test.url.run, env.envConfig));
  }

  return uacs;
};

// Create an array of test case objects from a string of testcase names
Executor.prototype.parseTests = function(tests) {
  var testObjects = {},
  cwd         = process.cwd(),
  testPaths   = [],
  testNames;

  if( !(typeof tests === 'string' || (typeof tests !== 'undefined' && Array.isArray(tests))) ) {
    return testObjects;
  }
  testNames = tests.split(',');

  testPaths = testNames.map(function(test) {
    var testPath;

    //If the test path begins with a '/' it's absolute
    if( test[0] === '/' ){
      testPath = test;
    //Otherwise it is relative - join it
    //with the current working directory
    }else{
      testPath = pathm.join(cwd, test);
    }

    //If the file or folder cannot be found
    //exit!
    if(!fs.existsSync(testPath)) {
      if(!fs.existsSync(testPath + '.js')) {
        logger.error(i18n('The test file "' + testPath + '" could not be found'));
        process.exit(1);
      }
    }

    return testPath;
  });

  testObjects = this.createTestObjects(testPaths);

  return testObjects;
};

// Take a list of absolute paths to testcase files and return array of TestCase objects
Executor.prototype.parseTestPaths = function(testPaths, testFilePaths) {
  var testFilePaths = testFilePaths || [];

  testPaths.forEach(function (path) {
    var stat,
    dirContents,
    test;

    // Don't try to traverse .venus folder
    if (path.match(/^.*\/\.venus$/)) {
      return;
    }

    // if path does not exist, try adding the .js
    // extension to it
    if(!fs.existsSync(path)) {
      path += '.js';
    }

    try {
      stat = fs.statSync(path);

      // check if testname is a dir or file
      if (stat.isDirectory()) {
        dirContents = fs.readdirSync(path);
        dirContents = dirContents.map(function(file) {
          return pathm.resolve(path, file);
        });

        this.parseTestPaths(dirContents, testFilePaths);
      } else if(_s.endsWith(path, '.js')) {
        if(!this.requireTestAnnotations || testcase.hasAnnotations(path)) {
          testFilePaths.push(path);
        } else {
          logger.debug( i18n('no annotations -- skipping test file %s', path) );
        }
      } else {
        // file is not a directory or a file that ends with '.js'
        logger.debug( i18n('skipping invalid test file %s', path) );
      }
    } catch (e) {
      logger.error( i18n('Cannot parse %s, %s', path, e ) );
      throw e;
    }
  }, this);

  return testFilePaths;
};

// Create all test objects
Executor.prototype.createTestObjects = function (testPaths) {
  var hostname        = this.hostname,
  testFilePaths   = this.parseTestPaths(testPaths),
  enableHotReload = (testFilePaths.length <= 5),
  testObjects     = {};

  if (!enableHotReload) {
    logger.warn(i18n('Disabling hot reload because there are more than 5 tests loaded'));
  }

  testFilePaths.forEach(function (testFilePath) {
    var testId;

    // Set the config path to the path of the current file
    configHelper.cwd = pathm.dirname(testFilePath);

    // create test case
    testId = this.getNextTestId();

    testObjects[testId] = testcase.create({
      path: testFilePath,
      id: testId,
      runUrl: 'http://' + hostname + ':' + this.port + this.urlNamespace + '/' + testId,
      runPath: this.urlNamespace + '/' + testId,
      instrumentCodeCoverage: this.enableCodeCoverage,
      config: configHelper.getConfig(),
      hotReload: enableHotReload
    });

    if (testObjects[testId]) {
      testObjects[testId].on('reload', this.reloadTest.bind(this));
    }
  }, this);

  return testObjects;

};

/**
 * Reload test
 * @param {object} test testcase object that has reloaded
 */
Executor.prototype.reloadTest = function (test) {
  this.io.sockets.emit('reload-test', test.id);
};

// Get a new test id
Executor.prototype.getNextTestId = function() {
  return this.testId++;
};

// Set up application environment
Executor.prototype.initEnvironment = function(config) {
  var app        = this.app = express(),
      homeFolder = this.homeFolder = config.homeFolder || __dirname;

  // express config
  app.engine('tl', consolidate.dust);
  app.set('view engine', 'tl');
  app.set('views', homeFolder + '/views');
  app.set('views');
  app.set('view options', { layout: null });

  app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
      data += chunk;
    });

    req.on('end', function() {
      req.body = data;
      next();
    });
  });

  // static resources
  app.use('/js', express.static(pathm.resolve(homeFolder, 'js')));
  app.use('/css', express.static(pathm.resolve(homeFolder, 'css')));
  app.use('/img', express.static(pathm.resolve(homeFolder, 'img')));
  app.use('/temp', express.static(pathm.resolve(constants.userHome, '.venus_temp')));

  // port
  this.port = config.port || PORT;
};

/**
* Prepend fixtures to body if they exist for current test
* @param {Object} test Test object
* @param {String} testId The testId to be used in the DOM id
* @param {String} harnessTemplate An HTML string
* @returns {String} String representing the harness template HTML
*/
Executor.prototype.loadFixtures = function(test, testId, harnessTemplate) {
  var fixtureContent = test.annotations[testcase.annotation.VENUS_FIXTURE],
  fixtureId = 'fixture_' + testId,
  fixturePartialReference;

  if (fixtureContent) {
    dust.loadSource(dust.compile(fixtureContent, fixtureId));
    fixturePartialReference = '<body><div id="venus-fixture-sandbox">{>' + fixtureId + '/}</div>';

    return harnessTemplate.replace(/<body>/, fixturePartialReference);
  }

  return false;
};

/**
* Responds to /sandbox/:testid route
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.handleSandboxPage = function(request, response) {
  var tests = this.testgroup.tests,
  testId = request.params.testid,
  test  = tests[testId],
  fixtureContent,
  templateData,
  harnessTemplate,
  harnessTemplateId;

  // Check if testid is valid and in the currently loaded testgroup
  if (!test || !test.harnessTemplate) {
    return response.status(404).json(
      { error: 'TestId ' + testId + ' does not exist' }
    );
  }

  fixtureContent = this.loadFixtures(test, testId, test.harnessTemplate);

  harnessTemplate = fixtureContent ? fixtureContent : test.harnessTemplate;

  // Set template data, and render the Dust template
  harnessTemplateId = 'harness_template_' + testId;

  dust.loadSource(dust.compile(harnessTemplate, harnessTemplateId));

  templateData = {
    scriptIncludes     : test.url.includes.slice(0, -1),
    testcaseFile       : _.last(test.url.includes),
    testId             : testId,
    host               : this.hostname,
    port               : this.port
  };

  dust.render(harnessTemplateId, templateData, function(err, out) {
    if(err) {
      response.status(500).json(
        { error: 'Harness template for test ' + testId + ' failed to render' }
      );
    }
    response.send(out);
  });
};

/**
* Responds to /sandbox/:testid/:resource route
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.handleSandboxResource = function(request, response) {
  var testId   = request.params.testid,
      resource = request.params.resource,
      path     = pathm.resolve(constants.userHome, '.venus_temp', 'test', testId, 'resources', resource);

  // Send resource only if it exists
  if (fs.existsSync(path)) {
    response.sendfile(path);
  }

  // If resource does not exist, send 404
  else {
    return response.status(404).json(
      { error: 'The resource ' + resource + ' does not exist' }
    );
  }
};

/**
* Responds to /:testid route
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.handleNamespacePage = function(request, response) {
  var tests = this.testgroup.tests,
  testId = request.params.testid,
  test  = tests[testId],
  harnessTemplate,
  harnessTemplateId,
  templateData,
  fixtureReset;

  // Check if testid is valid and in the currently loaded testgroup
  if (!test) {
    return response.status(404).json(
      { error: 'TestId ' + testId + ' does not exist' }
    );
  }

  fixtureReset = test.annotations[testcase.annotation.VENUS_FIXTURE_RESET];

  if (typeof fixtureReset === 'undefined') {
    fixtureReset = true;
  }

  // Set template data, and render the Dust template
  templateData = {
    postTestResultsUrl: this.urlNamespace + '/results/' + testId,
    testSandboxUrl: this.urlNamespace + '/sandbox/' + testId,
    testId: testId,
    fixtureReset: fixtureReset
  };

  harnessTemplate = configHelper.loadTemplate('default');
  harnessTemplateId = 'harness-' + testId;

  dust.loadSource(dust.compile(harnessTemplate, harnessTemplateId));

  dust.render(harnessTemplateId, templateData, function(err, out) {
    if (err) {
      response.status(500).json({
        error: 'Cannot render harness for test ' + testId
      });
    }
    response.send(out);
  });
};

/**
* Responds to /results/:testid route
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.handleResultsPage = function(request, response) {
  var testId = request.params.testid,
  test   = this.testgroup[testId];

  // Check if testid is valid and in the currently loaded testgroup
  if(!test) {
    return response.status(404).json(
      { error: 'TestId ' + testId + ' does not exist' }
    );
  }

  // Print test results
  console.log('\nTEST FILE: '.cyan + test.path.cyan);
  this.printResults(JSON.parse(request.body));

  process.exit(1);
};

/**
* Responds to / route
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.handleIndexPage = function(request, response) {
  var data  = { tests: [] },
  tests = this.testgroup.tests;

  Object.keys(tests).forEach(function (key) {
    data.tests.push(tests[key]);
  });
  response.render( 'executor/index', data );
};

/**
* Processes routes
* @param {Object} request Request object
* @param {Object} response Response object
*/
Executor.prototype.processRoute = function (routeFile) {
  return function (request, response) {
    fs.readFile(routeFile, function(err, data) {
      // // Set template data, and render the Dust template
      // templateData = {
      // postTestResultsUrl: exec.urlNamespace + '/results/' + testId,
      // testSandboxUrl: exec.urlNamespace + '/sandbox/' + testId,
      // testId: testId
      // };
      // harnessTemplate = configHelper.loadTemplate('default');
      // harnessTemplateId = 'harness-' + testId;
      // dust.loadSource(dust.compile(harnessTemplate, harnessTemplateId));
      // dust.render(harnessTemplateId, templateData, function(err, out) {
      if (err) {
        throw err;
      }
      response.send(data);
    });
  };
};

/**
 * Sets up the routes
 */
Executor.prototype.initRoutes = function() {
  var routes = this.config.routes,
  app  = this.app,
  routeKey;

  /** Index **/
  app.get('/', this.handleIndexPage.bind(this));

  // Set up routes explicitly defined in the config.
  if (routes) {
    for (var routeKey in routes) {
      app.get('/' + routeKey, this.processRoute(routes[routeKey]));
    }
  }

  /** Serves the sandbox page **/
  app.get(this.urlNamespace + '/sandbox/:testid', this.handleSandboxPage.bind(this));

  /** Serves sandbox resources **/
  app.get(this.urlNamespace + '/sandbox/:testid/:resource([^\\s]+)', this.handleSandboxResource.bind(this));

  // Serves the page that will render the sandbox in an iframe
  app.get(this.urlNamespace + '/:testid', this.handleNamespacePage.bind(this));

  /** Receive results for a test **/
  app.post(this.urlNamespace + '/results/:testid', this.handleResultsPage.bind(this));
};

/**
* Friendly browser name
*/
Executor.prototype.getFriendlyBrowserName = function( uaString ){
  var uaData  = ua.parse_user_agent( uaString ),
  phantom = uaString.match( /PhantomJS\W*[\d|\.]*/ );

if( phantom ) {
  return phantom[0];
}

return uaData.family + ' ' + uaData.major;
};

/**
* Print test results from client
*/
Executor.prototype.printResults = function (result) {
  var reporter = this.reporter,
      test,
      ua = this.getFriendlyBrowserName(result.userAgent || 'Unknown Browser'),
      file;

  if (!result.tests || !result.done) {
    return false;
  }

  if (!reporter) {
    return true;
  }

  test = this.testgroup.tests[result.testId];
  file = test.path;
  test.results = result;

  reporter.emit('file-start', test, this.getFriendlyBrowserName(result.userAgent));

  result.tests.forEach( function(test) {
    reporter.emit('test-start', test.name);

    if (test.status === 'PASSED') {
      reporter.emit('pass', test.name, test.message);
    } else {
      reporter.emit('fail', test.name, test.message, test.stackTrace);
    }

    reporter.emit('test-end', {
      name: test.name,
      status: test.status,
      message: test.message,
      stackTrace: test.stackTrace,
      ua: ua,
      file: file
    });
  });

  reporter.emit('file-end', result.done.runtime);

  return true;
};

Executor.prototype.printCodeCoverage = function(data) {
  var metrics;

  if (!data) {
    return;
  }

  function getColor(num) {
    var color = 'green';

    if (num < 0.5) {
      color = 'red';
    } else if (num < 0.8) {
      color = 'yellow';
    }

    return color;
  }

  metrics = coverage.parse(data);


  logger.info(i18n('Code Coverage').yellow);
  logger.info('---------------------------------------------------');
  logger.debug(JSON.stringify(data));

  Object.keys(metrics).forEach(function (file) {
    var keys = ['statements', 'functions', 'branches'];
    logger.info(file);

    keys.forEach(function (key) {
      var percent    = metrics[file][key].percent,
      percentStr = (percent * 100).toFixed(2) + '%',
      label      = '(' + key + ')';

      logger.info('  ' + percentStr[getColor(percent)] + '  ' + label.grey);
    });

    logger.info('\n');
  });
};

Executor.prototype.shutdown = function () {
  this.endTime = new Date();

  if (this.reporter) {
    this.reporter.emit('end', this.testgroup, this.endTime - this.startTime);
  }

  // print code coverage summary file
  coverage.writeSummary(this.testgroup.rawCodeCoverageData, this.enableCodeCoverage);

  if (this.hasFailures || this.reporter.errored) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

Executor.prototype.onResults = function(data, done) {
  var results;

  done = done || function() {};

  if (data) {
    results = this.printResults(data);

    if (data.codeCoverageData) {
      this.printCodeCoverage(data.codeCoverageData);
      if(!this.testgroup.addCodeCoverageResults(data.testId, data.codeCoverageData)) {
        logger.debug('Unable to record code coverage results for test ' + data.testId);
      }
    }
  }

  if(!results) {
    done({ status: 'error' });
  } else {
    done({ status: 'ok' });
  }

  if(data && data.done && data.done.failed > 0) {
    this.hasFailures = true;
  }

};

/**
 * Start server
 */
Executor.prototype.start = function(port, onStart) {
  var app   = this.app,
      self  = this,
      server,
      io,
      hook,
      hostname = this.hostname,
      onStart = onStart || function() {},
      def = deferred();

  portscanner.findAPortNotInUse(port, port + 1000, 'localhost', function(err, port) {

    // Try to start the HTTP server with the given port.  If the port is
    // occupied (can happen with a suspended process), call start() again
    // with 'port' incremented.  When the server is started successfully,
    // output a logging statement.
    server = http.createServer(app);
    server.on('listening', function() {
      // Start socket.io server
      this.io = io = ioserver.listen(hook, { 'log level': 0 });
      io.sockets.on('connection', function(socket) {
        socket.on('ping', function(fn) {
          fn({ time: Date.now(), port: port });
        });

        socket.on('results', _.bind(self.onResults, self));

        socket.on('console.log', function(data, done) {
          done = done || function() {};
          if(!data) {
            done({ status: 'error' });
          } else {
            logger.info( 'console: ' + data.yellow );
            done({ status: 'ok' });
          }
        });

        socket.on('execute:before:hook', function (data, done) {
          var testId, result, test;

          data = data || {};
          testId = data.testId;
          test = self.testgroup.getTestById(testId);

          if (test) {
            test.executeHook('before').then(done);
          } else {
            done();
          }
        });
      });

      def.resolve(port);
      onStart();
    }.bind(this));

    server.on('error',_.bind(function(e) {
      if ( e && (e.code === 'EADDRINUSE')) {
        this.start( port + 1 );
      }
    }, self));

    hook = server.listen(port);
  }.bind(this));

  return def.promise;
};

// Start a new Executor
function start(config) {
  var instance = new Executor();
  instance.init(config);
  return instance;
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
