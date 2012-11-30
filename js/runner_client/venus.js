// Create the Venus JavaScript object. This object will be accessible to all adaptors via window.venus
//  `host` and `port` are used to create the socket.io connection with the Venus server.
window.venus = new VenusClientLibrary({
  host: 'http://' + window.location.hostname,
  port: window.location.port
});
