'use strict';
var PORT        = 2013,
    express     = require('express'),
    hostname    = require('os').hostname(),
    colors      = require('colors'),
    path        = require('path'),
    i18n        = require('./util/i18n'),
    logger      = require('./util/logger'),
    netHelper   = require('./util/netHelper'),
    consolidate = require('consolidate'),
    portscanner = require('portscanner'),
    io          = require('socket.io-client');

/**
 * Test executor, responsible for running tests
 * /lib/executor.js
 * @author LinkedIn
 */
function Executor() {
  this.testId    = 1;
  this.port;
  this.socket;
}

/**
 * Initialize
 */
Executor.prototype.init = function(config) {
  this.connectOverlord(config.overlordUrl);
  this.initEnvironment(config);
  this.initRoutes();
  this.start(this.port);
}

/**
 * Connect to a overlord server
 * @param {string} url the overlord server's url
 */
Executor.prototype.connectOverlord = function(url) {
  var socket = this.socket = io.connect(url);
  socket.emit('request-open', { url: 'http://www.linkedin.com', id: this.getNextTestId() });
}

/**
 * Get a new test id
 */
Executor.prototype.getNextTestId = function() {
  return this.testId++;
}

/**
 * Set up application environment
 */
Executor.prototype.initEnvironment = function(config) {
  var app        = this.app = express.createServer(),
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

  // port
  this.port = config.port || PORT;
}

/**
 * Set up routes
 */
Executor.prototype.initRoutes = function() {
  var app = this.app;

  /** Index **/
  app.get('/', function(request, response) {
    response.render('executor/index', { hostname: hostname, port: port });
  });

  /** Capture **/
  app.get('/test/:testcases', function(request, response) {
    response.render('executor/fixture', { hostname: hostname, port: port });
  });

}

/**
 * Start server
 */
Executor.prototype.start = function(port) {
  var app   = this.app,
      retry = this.start;

  portscanner.findAPortNotInUse(port, port + 1000, 'localhost', function(err, port) {
    app.listen(port);
    logger.info('executor started on ' + hostname + ':' + port);
  });
}

/**
 * Start a new Executor
 * @param {Object} config options
 */
function start(config) {
  var instance = new Executor();
  logger.info('Starting the Executor');
  instance.init(config);
  return instance;
}

module.exports.Executor = Executor;
module.exports.start = start;
Object.seal(module.exports);
