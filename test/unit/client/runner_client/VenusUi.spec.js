/**
 * @venus-include-group dom
 * @venus-include polyfill/bind-polyfill.js
 * @venus-fixture fixtures/VenusUi.fixture.html
 * @venus-code runnerClient/VenusUi.js
 */
describe('VenusUi', function() {

  var _messages = {
    TEST_MESSAGE: 'This is a test \'test message\'',
    TEST_STACK_TRACE: 'This is a test stack trace'
  },
  _constants = {
    STATUS_PASSED: 'PASSED',
    STATUS_FAILED: 'FAILED',
    SUCCESS_CHARACTER: '✓',
    FAILURE_CHARACTER: 'X'
  },
  _selectors = {
    SUCCESS: '.pass',
    FAILURE: '.fail',
    NAV: 'nav',
    CODE: 'pre',
    TEST_LIST_ITEM: '.test-list',
    TEST_LIST_ITEM_DETAILS: '.details',
    TEST_LIST_ITEM_SUMMARY: '.summary'
  },
  _events = {
    RESULTS: 'results'
  },
  _results = {
    FAILURE: {
      done: {
        failed: true
      },
      tests: [
        {
          status: _constants.STATUS_FAILED,
          message: _messages.TEST_MESSAGE,
          stackTrace: _messages.TEST_STACK_TRACE
        },
        {
          status: _constants.STATUS_FAILED,
          message: _messages.TEST_MESSAGE,
          stackTrace: _messages.TEST_STACK_TRACE
        },
        {
          status: _constants.STATUS_PASSED,
          message: _messages.TEST_MESSAGE,
        },
        {
          status: _constants.STATUS_PASSED,
          message: _messages.TEST_MESSAGE,
        }
      ]
    },
    SUCCESS: {
      done: {
        failed: false
      },
      tests: [
        {
          status: _constants.STATUS_PASSED,
          message: _messages.TEST_MESSAGE,
        },
        {
          status: _constants.STATUS_PASSED,
          message: _messages.TEST_MESSAGE,
        },
        {
          status: _constants.STATUS_PASSED,
          message: _messages.TEST_MESSAGE,
        }
      ]
    }
  };

  ///////////////////
  //INITIALIZATION //
  ///////////////////
  it('should expect on the window as VenusUi', function() {
    expect(window.VenusUi).to.be.ok();
  });

  //////////////
  //RENDERING //
  //////////////
  it('should render markup to indicate failed tests', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  }),
        failSpy = sinon.spy(vui, 'failNav'),
        printSpy = sinon.spy(vui, 'printResults'),
        addResultSpy = sinon.spy(vui, 'addTestResults'),
        results = _results.FAILURE,
        $failureListItem,
        $failureSummary,
        $failureDetails;

    $(document).trigger(_events.RESULTS, results);

    $failureListItems = $(_selectors.TEST_LIST_ITEM + ' ' +_selectors.FAILURE);

    _.each($failureListItems, function(el) {
      expect($(el).find(_selectors.TEST_LIST_ITEM_SUMMARY).html()).to.eql(_constants.FAILURE_CHARACTER + ' ' + _messages.TEST_MESSAGE);
      expect($(el).find(_selectors.TEST_LIST_ITEM_DETAILS).html()).to.eql('<' + _selectors.CODE + '>' + _messages.TEST_STACK_TRACE + '</' + _selectors.CODE + '>');
    });

    expect(failSpy.calledOnce).to.be(true);
    expect(printSpy.calledOnce).to.be(true);
    expect(addResultSpy.callCount).to.eql(results.tests.length);
    expect($failureListItems.length).to.eql(_.where(results.tests, {status: _constants.STATUS_FAILED}).length);
  });

  it('should render markup to indicate successful tests', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  }),
        successSpy = sinon.spy(vui, 'successNav'),
        printSpy = sinon.spy(vui, 'printResults'),
        addResultSpy = sinon.spy(vui, 'addTestResults'),
        results = _results.SUCCESS,
        $successListItems,
        $successSummary;

    $(document).trigger(_events.RESULTS, results);

    $successListItems = $(_selectors.TEST_LIST_ITEM + ' ' +_selectors.SUCCESS);

    _.each($successListItems, function(el) {
      expect($(el).find(_selectors.TEST_LIST_ITEM_SUMMARY).html()).to.eql(_constants.SUCCESS_CHARACTER + ' ' + _messages.TEST_MESSAGE);
    });

    expect(successSpy.calledOnce).to.be(true);
    expect(printSpy.calledOnce).to.be(true);
    expect(addResultSpy.callCount).to.eql(results.tests.length);
    expect($successListItems.length).to.eql(_.where(results.tests, {status: _constants.STATUS_PASSED}).length);
  });

  ///////////////////
  //CLASS HANDLING //
  ///////////////////
  it('should show the results by handling the appropriate classes', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  });

    vui.showResults();

    expect(vui.$resultsView.hasClass(vui._selectors.ACTIVE)).to.be(true);
    expect(vui.$sandboxView.hasClass(vui._selectors.ACTIVE)).to.be(false);
    expect(vui.$resultsButton.parent().hasClass(vui._selectors.SELECTED)).to.be(true);
    expect(vui.$sandboxButton.parent().hasClass(vui._selectors.SELECTED)).to.be(false);
  });

  it('should show the sandbox by handling the appropriate classes', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  });

    vui.showSandbox();

    expect(vui.$resultsView.hasClass(vui._selectors.ACTIVE)).to.be(false);
    expect(vui.$sandboxView.hasClass(vui._selectors.ACTIVE)).to.be(true);
    expect(vui.$resultsButton.parent().hasClass(vui._selectors.SELECTED)).to.be(false);
    expect(vui.$sandboxButton.parent().hasClass(vui._selectors.SELECTED)).to.be(true);
  });

  it('should add the success class to the navigation if all tests passed successfully', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  }),
        results = _results.SUCCESS;

    $(document).trigger(_events.RESULTS, results);

    expect(vui.config.nav.hasClass(vui._selectors.SUCCESS)).to.be(true);
  });

  it('should add the failure class to the navigation if there are any failed tests', function() {
    var vui = new VenusUi({
                    nav: $(_selectors.NAV)
                  }),
        results = _results.FAILURE;

    $(document).trigger(_events.RESULTS, results);

    expect(vui.config.nav.hasClass(vui._selectors.FAILURE)).to.be(true);
  });
});
