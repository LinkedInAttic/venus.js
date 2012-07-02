/**
 * @author LinkedIn
 */
'use strict';
var PORT        = 2012,
    express     = require('express'),
    hostname    = require('os').hostname(),
    colors      = require('colors'),
    path        = require('path'),
    io          = require('socket.io'),
    _           = require('underscore'),
    i18n        = require('./util/i18n'),
    logger      = require('./util/logger'),
    consolidate = require('consolidate');

/**
 * Overlord server - allows slaves to be captured
 * @param {Object} config options
 */
function Overlord( config ) {
  var app,
      homeFolder,
      port;

  initEnvironment(config);
  initRoutes();
  initSocketIO();
  start();

  /**
   * Set up application environment
   */
  function initEnvironment(config) {
    app = express.createServer();

    homeFolder = config.homeFolder;

    app.engine('tl', consolidate.dust);

    // express config
    //app.set('view engine', 'ejs');
    app.set('view engine', 'tl');
    app.set('views', homeFolder + '/views');
    app.set('views');
    app.set('view options', { layout: null, i18n: i18n });

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
    port = parseInt(process.argv[2], 10) || PORT;
  }

  /**
   * Set up routes
   */
  function initRoutes() {

    /** Index **/
    app.get('/', function(request, response) {
      response.render('overlord/index', {
        i18n_overlord_running: i18n('Overlord running on %s:%s', hostname, port),
        i18n_capture: i18n('Capture this browser'),
        hostname: hostname,
        port: port });
    });

    /** Capture **/
    app.get('/capture', function(request, response) {
      response.render('overlord/capture', {
        i18n_message: i18n('Capture page running on %s:%s', hostname, port),
        hostname: hostname,
        port: port });
    });

    /** Sample data route - return JSON **/
    app.get('/data', function(request, response) {
      response.contentType('application/json');
      response.json( { test: 'hello world', success: true } );
    });

  }

  /**
   * Set up socket IO server
   */
  function initSocketIO() {
    io = io.listen(app);
    //io.set('log level', 1);
    io.sockets.on('connection', function(socket) {
      socket.on('request-open', function(e) {
        io.sockets.emit('open', e);
      });
    });
  }

  /**
   * Start server
   */
  function start() {
    app.listen(port);
    logger.info('server started on ' + hostname + ':' + port);
  }
}

/**
 * Start a overlord server
 * @param {Object} config options
 */
function start( config ) {
  return new Overlord(config);
}

module.exports.start = start;

Object.defineProperties(module.exports, {
  'defaultUrl': {
    value: 'http://'+hostname+':'+PORT,
    writeable: false
  }
});

Object.seal(module.exports);
