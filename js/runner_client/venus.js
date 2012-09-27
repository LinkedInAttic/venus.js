(function(window) {
  window.venus = new Venus();
  
  // var nativeLog = console.log;

  function Venus() {}

 var socket = io.connect('http://'+window.location.hostname,{port:2013});
 
  Venus.prototype.done = function(results) {
    results.testId = window.venus.testId;
    socket.emit("done", results);
  };

  // console.log = function(){
  //   socket.emit('console.log', arguments);
  //   nativeLog.apply(console,arguments);
  // }

}(window));
