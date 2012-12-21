/**
 *  @venus-type			casperjs
 */

var casper = require('casper').create({
    verbose: true,
    logLevel: 'warning'
});

casper.start('http://www.linkedin.com/', function() {
    this.test.assertTitle("World's Largest Professional Network | LinkedIn", 'linkedin homepage title is the one expected');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});

//To Run: venus run -t linkedin-title-spec.js