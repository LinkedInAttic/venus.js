var sys  = require('util'),
    exec = require('child_process').exec;

// check for operating system and set unzipCommand
if (process.platform === 'darwin') {
  unpack('unzip phantomjs-1.6.0-macosx-static.zip');
} else if (process.platform === 'linux') {
  unpack('tar -xvf phantomjs-1.6.0-linux-x86_64-dynamic.tar.tar.bz2 && mv phantomjs-1.6.0-linux-x86_64-dynamic phantomjs-1.6.0');
}

// remove the old phantomjs directory
// and unpack the proper file
function unpack(unzipCommand) {
  var command = [
    'cd phantomjs',
    'rm -rf phantomjs-1.6.0',
    unzipCommand,
    'cd phantomjs-1.6.0/bin',
    'mv phantomjs phantomjs-venus'
  ].join(' && ');

  exec(command);
}
