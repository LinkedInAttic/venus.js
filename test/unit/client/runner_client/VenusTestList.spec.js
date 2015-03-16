/**
 * @venus-include-group dom
 * @venus-fixture fixtures/VenusTestList.fixture.html
 * @venus-code runnerClient/VenusTestList.js
 */



describe('VenusTestList', function() {
  var constants = {
    testId: '01',
    testPrefix: '#test-'
  }
  it('should expect on the window as VenusTestList', function() {
    expect(window.VenusTestList).to.be.ok();
  });

  it('should remove \'pending\' class and add \'passed\' class to passed tests', function() {
  	var vtl = window.VenusTestList,
        resultFixture = $(constants.testPrefix + constants.testId);
    		result = {
          testId: constants.testId,
    		  done: {
            failed: false
          }
    		};

    vtl.postTestResults(result);
    expect(resultFixture.hasClass(vtl.constants["PASSED"])).to.be(true);
    expect(resultFixture.hasClass(vtl.constants["PENDING"])).to.be(false);
  });

  it('should remove \'pending\' class and add \'failed\' class to passed tests', function() {
    var vtl = window.VenusTestList,
        resultFixture = $(constants.testPrefix + constants.testId);
        result = {
          testId: constants.testId,
          done: {
            failed: true
          }
        };

    vtl.postTestResults(result);
    expect(resultFixture.hasClass(vtl.constants["FAILED"])).to.be(true);
    expect(resultFixture.hasClass(vtl.constants["PENDING"])).to.be(false);
  });

  it('should hide the loading indicator if there are no pending tests', function() {
    var vtl = window.VenusTestList,
        loader = $(vtl.selectors["LOADER"]);
        result = {
          testId: constants.testId,
          done: {
            failed: true
          }
        };

    vtl.postTestResults(result);
    expect(loader.css('display')).to.be('none');
  });
});
