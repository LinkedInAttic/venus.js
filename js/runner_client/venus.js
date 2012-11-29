window.venus = new VenusClientLibrary({
  host: 'http://' + window.location.hostname,
  port: window.location.port
});
window.venus.connect();
