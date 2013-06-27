var Base   = require('../../../lib/reporters/base').Base,
    sinon  = require('sinon'),
    expect = require('expect.js'),
    instance;

describe('base reporter', function() {
  beforeEach(function() {
    instance = new Base();
  });

  describe('init', function() {
    it('should attach event listeners', function() {
      var spy = sinon.spy(instance, 'on'),
          call;

      instance.init();

      call = spy.getCall(0);
      expect(call.args[0]).to.be('suite');
      expect(call.args[1]).to.be(instance.onSuite);
      call = spy.getCall(1);
      expect(call.args[0]).to.be('file');
      expect(call.args[1]).to.be(instance.onFile);
      call = spy.getCall(2);
      expect(call.args[0]).to.be('start');
      expect(call.args[1]).to.be(instance.onStart);
      call = spy.getCall(3);
      expect(call.args[0]).to.be('pass');
      expect(call.args[1]).to.be(instance.onPass);
      call = spy.getCall(4);
      expect(call.args[0]).to.be('fail');
      expect(call.args[1]).to.be(instance.onFail);
      call = spy.getCall(5);
      expect(call.args[0]).to.be('end');
      expect(call.args[1]).to.be(instance.onEnd);
      call = spy.getCall(6);
      expect(call.args[0]).to.be('file_end');
      expect(call.args[1]).to.be(instance.onFileEnd);
      call = spy.getCall(7);
      expect(call.args[0]).to.be('suite_end');
      expect(call.args[1]).to.be(instance.onSuiteEnd);
    });
  });

  describe('onStart', function() {
    it('should increment counter', function() {
      instance.onStart();

      expect(instance.total).to.be(1);
    });
  });

  describe('onPass', function() {
    it('should increment passed counter', function() {
      instance.onPass();

      expect(instance.passed).to.be(1);
    });
  });

  describe('onFail', function() {
    it('should increment failed counter', function() {
      instance.onFail();

      expect(instance.failed).to.be(1);
    });

    it('should add failure message and stacktrace to failures array', function() {
      var expected = {
        message: 'hello',
        stackTrace: 'world'
      };
      instance.onFail('hello', 'world');

      expect(instance.failures[0]).to.eql(expected);
    });
  });

  describe('onFileEnd', function() {
    it('should reset failures and counters', function() {
      var mock = sinon.mock(instance);
      mock.expects('resetCounters').once();
      instance.failures = 5;

      instance.onFileEnd();

      expect(instance.failures).to.eql([]);

      mock.verify();
    });
  });

  describe('resetCounters', function() {
    it('should reset total counter', function() {
      instance.total = 4;

      instance.resetCounters();

      expect(instance.total).to.be(0);
    });

    it('should reset failed counter', function() {
      instance.failed = 4;

      instance.resetCounters();

      expect(instance.failed).to.be(0);
    });

    it('should reset passed counter', function() {
      instance.total = 4;

      instance.resetCounters();

      expect(instance.passed).to.be(0);
    });
  });
});
