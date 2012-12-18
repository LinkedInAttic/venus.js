// @author LinkedIn

// Test executor that is responsible for serving test content and instantiating clients to run tests

'use strict';
var PORT        = 2013,
    express     = require('express'),
    hostname    = require('os').hostname(),
    http        = require('http'),
    colors      = require('colors'),
    path        = require('path'),
    i18n        = require('./util/i18n'),
    logger      = require('./util/logger'),
    consolidate = require('consolidate'),
    portscanner = require('portscanner'),
    fs          = require('fs'),
    pathm       = require('path'),
    ioserver    = require('socket.io'),
    testcase    = require('./testcase'),
    testrun     = require('./testrun'),
    phantom     = require('./uac/phantom'),
    casper     = require('./uac/casper'),
    seleniumUac = require('./uac/selenium'),
    _           = require('underscore'),
    _s          = require('underscore.string'),
    dust        = require('dustjs-linkedin'),
    pathHelper  = require('./util/pathHelper'),
    config      = require('./config'),
    fstools     = require('fs-tools'),
    ua          = require('useragent-parser');

// Constructor for Executor
function Executor() {
  this.testId    = 1;
  this.runners = [];
  this.port;
  this.socket;
};

// Initialize
Executor.prototype.init = function(options) {
  var testgroup,
      staticContent,
      casperRunners,
      runners = this.runners;

  // prepare static content
  staticContent = config.instance().get('static');

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

  // If overlord option is selected, connect to overlord
  // defaults to not using an overlord.
  if(options.overlord) {
    logger.info( i18n('Connecting to Overlord - %s', options.overlord) );
    this.connectOverlord(options.overlord, testgroup);
  }

  // If phantomjs is selected, start the browsers.
  if(options.phantom) {
    logger.verbose( i18n('Creating phantom runners') );
    this.runners = runners = runners.concat(this.createPhantomRunners(options));
  }

  if(options.selenium) {
    this.runners = runners = runners.concat( this.createSeleniumRunners( options ) );
  }

  //Create Casper runners for any casper tests
  casperRunners = this.createCasperRunners(options);
  this.runners = runners = runners.concat(casperRunners);

  this.runners.done = 0;
  this.initRoutes();
  this.start(this.port);
  setTimeout(_.bind(function() { this.runTests(); }, this), 1000);
};

// Copy static content to temp folder
Executor.prototype.prepStaticContent = function(paths) {
    var fspath, httpRoot, httpPath;

    httpRoot = pathm.resolve(__dirname + '/../temp/static');

    Object.keys(paths.value).forEach(function(key) {
      fspath = pathm.resolve(path.dirname(paths.src) + '/' + paths.value[key]);
      httpPath = pathm.resolve(httpRoot + '/' + key);

      // copy the file
      fstools.copy(fspath, httpPath, function(err) {
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
Executor.prototype.createPhantomRunners = function() {
  logger.verbose( i18n('Creating phantom runners') );
  return this.testgroup.testArray.map(function(test) {
    return phantom.create(test.url.run);
  });
};

Executor.prototype.createCasperRunners = function() {
  var runners = [],
    test;
  logger.verbose( i18n('Creating casperjs runners') );
  for(var i = 0; i < this.testgroup.testArray.length; i++) {
    test = this.testgroup.testArray[i];
    if(test.annotations['venus-type'] && test.annotations['venus-type'] === 'casperjs') {
      runners.push(casper.create(test.path));
    }
  }
  return runners;
}

/*
 * Create selenium runners
 */
Executor.prototype.createSeleniumRunners = function( options ){
  var browserName = options.seleniumBrowser || 'firefox',
      server = options.seleniumServer || 'localhost';

  logger.verbose( i18n('Creating selenium uacs') );
  logger.verbose( i18n('Server: ' + server) );
  logger.verbose( i18n('Browser: ' + browserName) );
  return this.testgroup.testArray.map(function(test) {
    return seleniumUac.create(test.url.run, {
      host: server,
      desiredCapabilities: {
        browserName: browserName
      }
    });
  });
}

/**
 * Connect to a overlord server
 * @param {string} url the overlord server's url
 */
Executor.prototype.connectOverlord = function(url) {
  var socket;
  socket = this.socket = io.connect(url);

  /*testrun.testArray.forEach(function(test) {
    console.log(test.url.run);
  });
  socket.emit('request-open', { url: 'http://www.linkedin.com', id: this.getNextTestId() });*/
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
    return pathm.join(cwd, test);
  });

  testObjects = this.parseTestPaths(testPaths);

  return testObjects;
};

// Take a list of absolute paths to testcase files and return array of TestCase objects  
Executor.prototype.parseTestPaths = function(testPaths, testObjects) {
  testObjects = testObjects || {};

  testPaths.forEach(function (path, idx, list) {
    var stat,
        dirContents,
        test,
        testId;

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
       dirContents = dirContents.map(function(file, idx) {
         return pathm.resolve(path, file);
       });

       this.parseTestPaths(dirContents, testObjects);

     } else if(_s.endsWith(path, '.js')) {
       // create test case
       testId = this.getNextTestId();

       test = testcase.create(
         path,
         testId,
         'http://' + hostname + ':' + this.port + '/test/' + testId);

       testObjects[testId] = test;
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
  app.use('/js', express.static(homeFolder + '/js'));
  app.use('/css', express.static(homeFolder + '/css'));
  app.use('/img', express.static(homeFolder + '/img'));
  app.use('/temp', express.static(homeFolder + '/temp'));

  // port
  this.port = config.port || PORT;
};

// Set up routes    
Executor.prototype.initRoutes = function() {
  var app  = this.app,
      port = this.port,
      exec = this,
      tests = this.testgroup.tests,
      host = hostname;

  /** Index **/
  app.get('/', function(request, response) {
    response.render('executor/index', { hostname: hostname, port: port });
  });

  /** Serves the sandbox page **/
  app.get('/test/sandbox/:testid', function(request, response) {
    var tests = exec.testgroup.tests,
        testId = request.params.testid,
        test  = tests[testId],
        fixtureContent,
        fixtureId,
        fixturePartialReference,
        templateData,
        harnessTemplate,
        harnessTemplateId;

    // Check if testid is valid and in the currently loaded testgroup
    if (!test || !test.harnessTemplate) {
      return response.status(404).json(
        { error: 'TestId ' + testId + ' does not exist' }
      );
    }

    // Load the test fixture (ie. @venus-fixture) content via Dust. Then,
    // modify fixtureTemplate by finding the closing 'body' tag, and prepending
    // it with a reference to the test fixture, using Dust partials.
    fixtureContent = test.annotations[testcase.annotation.VENUS_FIXTURE];
    fixtureId = 'fixture_' + testId;
    dust.loadSource(dust.compile(fixtureContent, fixtureId));
    fixturePartialReference = '<body>{>' + fixtureId + '/}';

    harnessTemplate = test.harnessTemplate;
    harnessTemplate = harnessTemplate.replace(/<body>/,
                                              fixturePartialReference);

    // Set template data, and render the Dust template
    harnessTemplateId = 'harness_template_' + testId;
    dust.loadSource(dust.compile(harnessTemplate, harnessTemplateId));
    templateData = {
      scriptIncludes     : test.url.includes.slice(0, -1),
      testcaseFile       : _.last(test.url.includes),
      testId             : testId,
      host               : host,
      port               : port
    };
    dust.render(harnessTemplateId, templateData, function(err, out) {
      if(err) {
        response.status(500).json(
          { error: 'Harness template for test ' + testId + ' failed to render' }
        );
      }
      response.send(out);
    });
  });

  // Serves the page that will render the sandbox in an iframe
  app.get('/test/:testid', function(request, response) {
    var tests = exec.testgroup.tests,
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
      postTestResultsUrl: '/test/results/' + testId,
      testId: testId
    };
    harnessTemplate = config.instance().loadTemplate('default');
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
  });

  /** Receive results for a test **/
  app.post('/test/results/:testid', function(request, response) {
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
    exec.printResults(JSON.parse(request.body));

    process.exit(1);
  });
}

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
}

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
}

/**
 * Start server
 */
Executor.prototype.start = function(port, onStart) {
  var app   = this.app,
      self  = this,
      server,
      io,
      hook,
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

        socket.on('results', function(data, done) {
          var results = self.printResults(data);
          done = done || function() {};

          if(!results) {
            done({ status: 'error' });
          } else {
            done({ status: 'ok' });
          }

          self.runners.done++;

          if(data.done && data.done.failed > 0) {
            self.hasFailures = true;
          }

          if( self.runners.length > 0 && self.runners.done == self.runners.length ){
            setTimeout(function(){
              self.runners.forEach( function( runner ){
                if( runner.shutdown ){
                  runner.shutdown();
                }
              });

              if( self.hasFailures ){
                process.exit(1);
              }else{
                process.exit(0);
              }
            }, 1000);
          }
        });

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
};

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
