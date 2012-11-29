// @author LinkedIn 

// An anonymous closure that will create the Venus JavaScript object. This object will be accessible to all adaptors via window.venus.   
(function(window) {

  // Instantiate Venus object  
  window.venus = new Venus();

  function Venus() {}

  // Create XHR  
  var XHR = (function() {
    var ids = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
    if (typeof XMLHttpRequest !== "undefined") {
      return XMLHttpRequest;
    }

    for (var i = 0; i < ids.length; i++) {
      try {
        new ActiveXObject(ids[i]);
        return function() {
          return new ActiveXObject(ids[i]);
        };
        break;
      } catch (e) {}
    }
  })();

  // Once all unit tests are done, send the test results via POST request  
  Venus.prototype.done = function(results) {
    var xmlhttp = new XHR();
    var result = JSON.stringify(results);
    xmlhttp.open("POST", window.venus.postUrl, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", result.length);
    xmlhttp.setRequestHeader("Connection", "close");
    xmlhttp.send(result);
  };
}(window));