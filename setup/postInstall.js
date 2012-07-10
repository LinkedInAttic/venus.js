var sys  = require('util'),
    exec = require('child_process').exec,
    i18n      = require('../lib/util/i18n'),
    logger    = require('../lib/util/logger');

exec('cd phantomjs/phantomjs-1.6.0/bin && echo $PWD', function (error, stdout, stderr) {
	var pwd = stdout.replace(/(\r\n|\n|\r)/gm,"");
	logger.info(i18n('please add phantomjs-venus to your PATH by adding the following line to your ~/.profile or ~/.bash_profile or ~/.bashrc or ~/.zshenv (remember to source):\n'));
	logger.info(i18n('export PATH='+pwd+':$PATH\n'));
});