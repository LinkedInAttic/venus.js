(function(window, config) {


  function Venus() {}

  Venus.prototype.done = function(results) {
    results.testId = config.testId;
    this.socket.emit('test results', results);
  };

  Venus.prototype.init = function() {
    var host = config.hostname,
        port = config.port,
        protocol = window.location.protocol,
        socket,
        print;

    socket = io.connect(protocol + '//' + host + ':' + port);
    print  = console.log;

    console.log = function() {
      print.apply(this, arguments);
      socket.emit('console.log', Array.prototype.slice.call(arguments, 0));
    };

    this.socket = socket;
  };


  window.venus = new Venus();
  window.venus.init();
}(window, window.venusConfig));
