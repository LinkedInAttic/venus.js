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
    path         = require('path'),
    i18n         = require('./util/i18n'),
    logger       = require('./util/logger'),
    consolidate  = require('consolidate'),
    portscanner  = require('portscanner'),
    fs           = require('fs'),
    pathm        = require('path'),
    ioserver     = require('socket.io'),
    testcase     = require('./testcase'),
    testrun      = require('./testrun'),
    phantom      = require('./uac/phantom'),
    casper       = require('./uac/casper'),
    seleniumUac  = require('./uac/webdriver'),
    saucelabsUac = require('./uac/saucelabs'),
    _            = require('underscore'),
    _s           = require('underscore.string'),
    dust         = require('dustjs-linkedin'),
    configHelper = require('./config'),
    fstools      = require('fs-tools'),
    ua           = require('useragent-parser'),
    coverage     = require('./coverage'),
    constants    = require('./constants');

// Constructor for Executor
function Executor(config) {
  // events.EventEmitter.call(this);
  this.testId       = 1;
  this.runners      = [];
  this.port         = null;
  this.socket       = null;
  this.urlNamespace = '/venus-core';
  this.config       = config || configHelper.instance();
  this.hostname     = constants.hostname;
}

// util.inherits(Executor, events.EventEmitter);
// Initialize
Executor.prototype.init = function(options, onStart) {
  var testgroup,
      staticContent,
      casperRunners,
      runners = this.runners;

  // set hostname if desired
  if (options.hostname) {
    this.hostname = options.hostname;
  } else if (this.config.get('hostname')) {
    this.hostname = this.config.get('hostname').value;
  }

  // set code coverage flag
  if (options.coverage) {
    this.enableCodeCoverage = true;
  }

  // set require annotations flag
  if (options.requireAnnotations) {
    this.requireTestAnnotations = true;
  }

  // prepare static content
  staticContent = this.config.get('static');

  if(staticContent) {
    this.prepStaticContent(staticContent);
  }

  this.initEnvironment(options);

  // Parse the list of relative paths specified in the command line arguments
  // in to an array of testcase objects.
  testgroup = this.testgroup = testrun.create(this.parseTests(options.test));

  // If no tests were selected to run, there is nothing to do.
  // log an error and return.
  // TODO: we may want to change this to throw an exception.
  if(testgroup.testCount === 0) {
    logger.error( i18n('No tests specified to run - exiting') );
    return false;
  }

  // Print test URLs
  testgroup.urls.forEach(function(url) {
    logger.info('Serving test: ' + url.run.yellow);
  });

  // If phantomjs is selected, start the browsers.
  if(options.phantom) {
    logger.verbose( i18n('Creating phantom runners') );
    this.runners = runners = runners.concat(this.createPhantomRunners(options));
  }

  if(options.selenium) {
    this.runners = runners = runners.concat(this.createSeleniumRunners(options));
  }

  if(options.sauceLabs) {
    this.runners = runners = runners.concat(this.createSauceLabsRunners(options));
  }

  //Create Casper runners for any casper tests
  casperRunners = this.createCasperRunners(options);
  this.runners = runners = runners.concat(casperRunners);

  this.runners.done = 0;
  this.initRoutes();
  this.start(this.port, onStart);
  process.nextTick(function() {
    this.runTests();
  }.bind(this));
};

// Copy static content to temp folder
Executor.prototype.prepStaticContent = function(paths) {
    var fspath, httpRoot, httpPath;

    httpRoot = pathm.resolve(constants.userHome, '.venus_temp', 'static');

    Object.keys(paths.value).forEach(function(key) {
      fspath = pathm.resolve(path.dirname(paths.src) + '/' + paths.value[key]);
      httpPath = pathm.resolve(httpRoot + '/' + key);

      // copy the file
      fstools.copy(fspath, httpPath, function(err) {
        debugger;
        if(err) {
          logger.error( i18n('error copying test file %s. exception: %s', httpPath, err) );
        }
      });
    });
};

// Start test runners!
Executor.prototype.runTests = function() {
  this.runners.forEach(function(runner) {
    runner.runTest();
  });
};

// Create phantom runners for a test run
Executor.prototype.createPhantomRunners = function( options ) {
  var phantomPath, runners = [], test;

  logger.verbose( i18n('Creating phantom runners') );

  // resolve path to phantom binary
  phantomPath = options.phantom;

  if( phantomPath === true ){
    phantomPath = undefined;
  }

  if( !phantomPath ){
    phantomPath = this.config.resolve('binaries.phantomjs');
  }

  if (!fs.existsSync(phantomPath)) {
    phantomPath = null;
  }

  logger.verbose( i18n('Creating phantomjs UACs') );

  if( phantomPath ){
    logger.verbose( i18n('Using phantomjs binary at %s', phantomPath) );
  }

  for(var i = 0; i < this.testgroup.testArray.length; i++) {
    test = this.testgroup.testArray[i];
    if(!test.annotations['venus-type'] || test.annotations['venus-type'] !== 'casperjs') {
      runners.push(phantom.create(test.url.run, phantomPath));
    }
  }
  return runners;
};

Executor.prototype.createCasperRunners = function() {
  var runners = [],
    test;
  logger.verbose( i18n('Creating casperjs runners') );
  for(var i = 0; i < this.testgroup.testArray.length; i++) {
    test = this.testgroup.testArray[i];
    if(test.annotations['venus-type'] && test.annotations['venus-type'] === 'casperjs') {
      runners.push(casper.create(test, _.bind(this.onResults, this)));
    }
  }
  return runners;
};

/*
 * Create selenium runners
 */
Executor.prototype.createSeleniumRunners = function( options ){
  var browserName, server, version;

  if (options.seleniumBrowser) {
    browserName = options.seleniumBrowser;
  } else if (options.browser) {
    browserName = options.browser.split('|')[0];
    version = options.browser.split('|')[1];
  } else if (this.config.get('selenium.browser')) {
    browserName = this.config.get('selenium.browser').value;
  } else {
    browserName = 'firefox';
  }

  if (!version && this.config.get('selenium.version')) {
    version = this.config.get('selenium.version').value;
  }

  server = options.seleniumServer || options.selenium,

  logger.verbose( i18n('Creating selenium uacs') );
  logger.verbose( i18n('Server: ' + server) );
  logger.verbose( i18n('Browser: ' + browserName) );

  if (server === true || !server) {
    server = this.config.get('selenium.host').value || 'localhost';
  }

  return this.testgroup.testArray.map(function(test) {
    return seleniumUac.create(test.url.run, {
      host: server,
      desiredCapabilities: {
        browserName: browserName,
        version: version
      }
    });
  });
};

/*
 * Create sauce labs runners
 */
Executor.prototype.createSauceLabsRunners = function(options) {
  var server      = (options.sauceLabs && options.sauceLabs.length) ? options.sauceLabs             : this.config.sauceLabs.host,
      browserName = (options.browser   && options.browser.length)   ? options.browser.split('|')[0] : this.config.sauceLabs.browser,
      version     = (options.browser   && options.browser.length)   ? options.browser.split('|')[1] : this.config.sauceLabs.version,
      platform    = (options.platform  && options.platform.length)  ? options.platform              : this.config.sauceLabs.platform,
      username    = (options.username  && options.username.length)  ? options.username              : this.config.sauceLabs.username,
      accessKey   = (options.accessKey && options.accessKey.length) ? options.accessKey             : this.config.sauceLabs.accessKey;

  logger.verbose( i18n('Creating sauce labs uacs') );
  logger.verbose( i18n('Server: ' + server) );
  logger.verbose( i18n('Browser: ' + browserName) );
  logger.verbose( i18n('Version: ' + version) );
  logger.verbose( i18n('Platform: ' + platform) );
  logger.verbose( i18n('Username: ' + username) );
  logger.verbose( i18n('Access Key: ' + accessKey) );

  return this.testgroup.testArray.map(function(test) {
    return saucelabsUac.create(test.url.run, {
      host: server,
      desiredCapabilities: {
        browserName: browserName,
        version: version,
        platform: platform,
        username: username,
        accessKey: accessKey
      }
    });
  });
}

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

    if( test[0] === '/' ){
      return test;
    }

    return pathm.join(cwd, test);
  });

  testObjects = this.parseTestPaths(testPaths);

  return testObjects;
};

// Take a list of absolute paths to testcase files and return array of TestCase objects
Executor.prototype.parseTestPaths = function(testPaths, testObjects) {
  var testObjects = testObjects || {},
      hostname = this.hostname;

  testPaths.forEach(function (path) {
    var stat,
        dirContents,
        test,
        testId;

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

       this.parseTestPaths(dirContents, testObjects);

     } else if(_s.endsWith(path, '.js')) {
       // create test case
       testId = this.getNextTestId();

       test = testcase.create(
         path,
         testId,
         'http://' + hostname + ':' + this.port + this.urlNamespace + '/' + testId,
         this.enableCodeCoverage
       );

       if(!this.requireTestAnnotations || test.hasAnnotations) {
         testObjects[testId] = test;
       } else {
         logger.warn( i18n('no annotations -- skipping test file %s', path) );
       }
     } else {
       logger.warn( i18n('skipping invalid test file %s', path) );
     }
   } catch(e) {
     logger.error( i18n('Cannot parse %s, %s', path, e ) );
     throw e;
   }
  }, this);

  return testObjects;
};

// Get a new test id
Executor.prototype.getNextTestId = function() {
  return this.testId++;
};

// Set up application environment
Executor.prototype.initEnvironment = function(config) {
  var app        = this.app = express(),
      homeFolder = this.homeFolder = config.homeFolder;

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
  templateData;

  // Check if testid is valid and in the currently loaded testgroup
  if (!test) {
    return response.status(404).json(
      { error: 'TestId ' + testId + ' does not exist' }
    );
  }

  // Set template data, and render the Dust template
  templateData = {
    postTestResultsUrl: this.urlNamespace + '/results/' + testId,
    testSandboxUrl: this.urlNamespace + '/sandbox/' + testId,
    testId: testId
  };

  harnessTemplate = this.config.loadTemplate('default');
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
    test = tests[testId];

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
  var routes = this.config.get('routes'),
      app  = this.app,
      routeKey;

  /** Index **/
  app.get('/', this.handleIndexPage.bind(this));

  // Set up routes explicitly defined in the config.
  if (routes) {
    routes = routes.value;
    for (var routeKey in routes) {
      app.get('/' + routeKey, this.processRoute(routes[routeKey]));
    }
  }

  /** Serves the sandbox page **/
  app.get(this.urlNamespace + '/sandbox/:testid', this.handleSandboxPage.bind(this));

  // Serves the page that will render the sandbox in an iframe
  app.get(this.urlNamespace + '/:testid', this.handleNamespacePage.bind(this));

  /** Receive results for a test **/
  app.post(this.urlNamespace + '/results/:testid', this.handleResultsPage);
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
Executor.prototype.printResults = function(result) {
  if(!result.tests || !result.done) return false;

  console.log( '\n--------------------------------------------------------' );
  console.log( '\n' );
  console.log( this.getFriendlyBrowserName( result.userAgent ).yellow );

  result.tests.forEach(function(test) {
    console.log('\n   ' + test.name);

    if (test.status === 'PASSED') {
      console.log('\r     ✓'.green + ' ' + test.message.green);
    } else {
      console.log('\r     x'.red + ' ' + test.message.red);
    }

    if (test.stackTrace) {
      console.log('\r   ' + test.stackTrace);
    };

    console.log('\r');
  });

  if (result.done.failed === 0) {
    var content = result.done.passed === 1 ? ' test completed' : ' tests completed',
    message = '\n✓' + ' ' + result.done.passed.toString() + content +
      ' (' + result.done.runtime.toString()  + 'ms)';

    console.log(message.green);
  } else {
    var content = result.done.failed === 1 ? ' test failed' : ' tests failed',
    message = '\nx' + ' ' + result.done.failed.toString() + ' of ' + result.done.total.toString() + content +
      ' (' + result.done.runtime.toString()  + 'ms)';

    console.log(message.red);
  }

  console.log('\r');
  return true;
};

Executor.prototype.printCodeCoverage = function(data) {
  var metrics;

  if (!data) return;

  function getColor(num) {
    var color = 'green';

    if (num < .5) {
      color = 'red';
    } else if (num < .8) {
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

Executor.prototype.onResults = function(data, done) {
  var results;

  done = done || function() {};

  if(data) {
    results = this.printResults(data);
    this.printCodeCoverage(data.codeCoverageData);
  }

  if(!results) {
    done({ status: 'error' });
  } else {
    done({ status: 'ok' });
  }

  this.runners.done++;

  if(data && data.done && data.done.failed > 0) {
    this.hasFailures = true;
  }

  if( this.runners.length > 0 && this.runners.done == this.runners.length ){
    process.nextTick(function () {
      this.runners.forEach( function( runner ){
        if( runner.shutdown ){
          runner.shutdown();
        }
      });
      if( this.hasFailures ){
        process.exit(1);
      }else{
        process.exit(0);
      }
    }.bind(this));
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
      onStart = onStart || function() {};

  portscanner.findAPortNotInUse(port, port + 1000, 'localhost', function(err, port) {

    // Try to start the HTTP server with the given port.  If the port is
    // occupied (can happen with a suspended process), call start() again
    // with 'port' incremented.  When the server is started successfully,
    // output a logging statement.
    server = http.createServer(app);
    server.on('listening', function() {
      logger.info('executor started on ' + hostname + ':' + port);

      // Start socket.io server
      io = ioserver.listen(hook, { 'log level': 0 });
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
      });

      onStart();
    });

    server.on('error',_.bind(function(e) {
      if ( e && (e.code === 'EADDRINUSE')) {
        this.start( port + 1 );
      }
    }, self));

    hook = server.listen(port);
  });
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
