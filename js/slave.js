/**
 * Browser Slave
 * @author LinkedIn
 */
function Slave(config) {
  init();

  function init() {
    var socket = io.connect(config.masterUrl);
    socket.on('open', function(e) {
      var url = e.url,
          iframe = document.createElement('iframe');

      iframe.src = url;
      document.body.appendChild(iframe);
    });
  }
}
