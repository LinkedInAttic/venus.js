(function(window) {
  window.venus = new Venus();

  function Venus() {}

  Venus.prototype.done = function(results) {
  	console.log(results);
    $.post(window.venus.postUrl, JSON.stringify(results));
    console.log('posted results to', window.venus.postUrl);
  };
}(window));
