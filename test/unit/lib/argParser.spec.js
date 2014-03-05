var expect  = require('expect.js'),
    helpers = require('../../helpers'),
    parse   = helpers.lib('argParser');

describe('argParser', function () {
  describe('key/value pairs', function () {
    var input, output;

    before(function () {
      input  = args(
        'invalid', '--lonely_key', '--config=test/foobar/.filerc-1',
        '--config_win=c:\\test\\foobar', '--browser=chrome',
        '--name_=seth', '--default', '--glob=*.js');
      output = parse(input);
    });

    it ('browser should be chrome', function () {
      expect(output.browser).to.be('chrome');
    });

    it ('name_ should be seth', function () {
      expect(output.name_).to.be('seth');
    });

    it ('lonely_key should be true (no value)', function () {
      expect(output.lonely_key).to.be(true);
    });

    it ('config should be test/foobar/.filerc-1', function () {
      expect(output.config).to.be('test/foobar/.filerc-1');
    });

    it ('config_win should be c:\\test\\foobar', function () {
      expect(output.config_win).to.be('c:\\test\\foobar');
    });

    it ('glob should be *.js', function () {
      expect(output.glob).to.be('*.js');
    });

    it ('invalid should be ignored', function () {
      expect(output.ignored.length).to.be(3);
    });
  });
});

function args() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift('node', 'foo.js');
  return args;
}
