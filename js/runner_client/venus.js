(function(window) {
  window.venus = new Venus();
  var isMaster = (window === window.top) ? true : false
  var nativeLog;
  var socket = (isMaster) ? io.connect('http://'+window.location.hostname,{port:2013}) : null;

  function Venus() {}
 
  Venus.prototype.done = function(results) {
    results.testId = window.venus.testId;
    socket.emit('done', results);
  };

  // this makes all consoles use the parent
  // and makes the parent also emit via socket.io
  nativeLog = (console && console.log) ? console.log : function() {};
  if (isMaster) {
    // top level window
    if (console && console.log) {
      console.log = function(){
        nativeLog.apply(console,arguments);
        var args = [].slice.call(arguments, 0);
        socket.emit('console.log', args.join(","));
      };
    }
  }
  else {
    // in an iframe, must be running a test
    if (console && console.log) {
      console.log = function() {
        window.top.console.log.apply(this, arguments);
      };
    }
  }

}(window));
