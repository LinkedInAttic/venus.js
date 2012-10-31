(function(window) {
  window.venus = new Venus();

  function Venus() {}

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
