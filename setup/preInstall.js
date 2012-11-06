var sys  = require('util'),
    exec = require('child_process').exec;

// Check to make sure PhantomJS 1.6.0 is installed (see http://phantomjs.org/)
exec('phantomjs --version', function(error, stdout, stderr) {
  if(stdout.trim() == '1.6.0') {
    sys.puts('PhantomJS 1.6.0 is installed -- good to go.');
  } else {
    sys.puts('Could not find PhantomJS 1.6.0 -- please install before continuing.');
  }
});

