var expect = chai.expect;

describe('Search Service', function() {

  var mockCtrl, $httpMock;

  var urlRegEx = new RegExp(/\/search(\?.*)?/);

  /** SETUP **/
  // Load the benefisher.services module
  beforeEach(module('benefisher.services'));

  // Inject the $httpBackend service for mocking http requests
  beforeEach(inject(function ($httpBackend) {
    $httpMock = $httpBackend;
    $httpMock.when('GET', urlRegEx).respond("Test Response");
  }));

  // Setup a mock controller
  beforeEach(function() {
    mockCtrl = {
      params: { testParam: 'testValue' },
      update: function(promise) {
        this.promise = promise;
      }
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
    search.subscribe(mockCtrl);
  }));

  it('should make http request on search', inject(function(search) {
    $httpMock.expectGET(urlRegEx);
    search.subscribe(mockCtrl);
    search.search(mockCtrl.params);
    $httpMock.flush();
  }));

  it('should update subscribers with http response data', inject(function(search) {
    $httpMock.expectGET(urlRegEx);
    search.subscribe(mockCtrl);
    search.search(mockCtrl.params);
    $httpMock.flush();
    mockCtrl.promise.then(function(response) {
      expect(response.data).to.equal("Test Response");
    });
  }));

});