/**
 * @author LinkedIn
 */
'use strict';
var PORT      = 2012;
var express   = require('express');
var hostname  = require('os').hostname();
var colors    = require('colors');
var path      = require('path');
var app       = express.createServer();
var io        = require('socket.io');
var _         = require('underscore');
var i18n      = require('./i18n');

/**
 * Master server - allows slaves to be captured
 * @param {Object} config options
 */
function Master( config ) {
  var homeFolder;
  var port;

  initEnvironment(config);
  initRoutes();
  initSocketIO();
  start();

  /**
   * Set up application environment
   */
  function initEnvironment(config) {
    homeFolder = config.homeFolder;
    //console.log('   info  -'.cyan, 'Application root'.yellow, homeFolder);

    // express config
    app.set('view engine', 'ejs');
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
      response.render('master/index', { hostname: hostname, port: port });
    });

    /** Capture **/
    app.get('/capture', function(request, response) {
      response.render('master/capture', { hostname: hostname, port: port });
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
    console.log('server started on'.yellow, (hostname + ':' + port).cyan);
  }
}

/**
 * Start a master server
 * @param {Object} config options
 */
function start( config ) {
  return new Master(config);
}

module.exports.start = start;

Object.defineProperties(module.exports, {
  'defaultUrl': {
    value: 'http://'+hostname+':'+PORT,
    writeable: false
  }
});

Object.seal(module.exports);
