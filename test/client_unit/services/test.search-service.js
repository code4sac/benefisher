var expect = chai.expect;

describe('Search Service', function() {

  var mockCtrl;
  var $httpMock;

  // Search url with test parameters (see mockCtrl).
  var url = '/search?testParam=testValue';

  /** SETUP **/
  // Load the benefisher.services module
  beforeEach(module('benefisher.services'));

  // Inject the $httpBackend service for mocking http requests
  beforeEach(inject(function ($httpBackend) {
    $httpMock = $httpBackend;
    $httpMock.when('GET', url).respond("Test Response");
  }));

  // Setup a mock controller
  beforeEach(function() {
    mockCtrl = {
      params: { testParam: 'testValue' },
      update: sinon.spy()
    };
  });

  // Verify that no exceptions were raised during http calls, and all calls were returned.
  afterEach(function() {
    $httpMock.verifyNoOutstandingExpectation();
    $httpMock.verifyNoOutstandingRequest();
  });

  /** TESTS **/
  it('should accept subscribers', inject(function(search) {
    mockCtrl = {};
    search.subscribe(mockCtrl.update);
  }));

  it('should make http request on search', inject(function(search) {
    $httpMock.expectGET(url);
    search.subscribe(mockCtrl.update);
    search.search(mockCtrl.params);
    $httpMock.flush();
  }));

  it('should update subscribers with http response data', inject(function(search) {
    $httpMock.expectGET(url);
    search.subscribe(mockCtrl.update);
    search.search(mockCtrl.params);
    $httpMock.flush();
    expect(mockCtrl.update).to.have.been.calledWith("Test Response");
  }));

});