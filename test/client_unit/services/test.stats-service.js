var expect = chai.expect;

describe('Stats Service', function() {

  var $httpMock;

  // Search url with test parameters (see mockCtrl).
  var url = '/stats';

  /** SETUP **/
  // Load the benefisher.services module
  beforeEach(module('benefisher.services'));

  // Inject the $httpBackend service for mocking http requests
  beforeEach(inject(function ($httpBackend) {
    $httpMock = $httpBackend;
    $httpMock.when('POST', url).respond({});
  }));

  // Verify that no exceptions were raised during http calls, and all calls were returned.
  afterEach(function() {
    $httpMock.verifyNoOutstandingExpectation();
    $httpMock.verifyNoOutstandingRequest();
  });

  it('should make http request when a query is added', inject(function(stats) {
    $httpMock.expectPOST(url);
    stats.query({terms: 'term1,term2'});
    $httpMock.flush();
  }));


  it('should make http request when an interaction is added', inject(function(stats) {
    $httpMock.expectPOST(url);
    stats.interaction({result: '123', type: 'click', target: 'phone'});
    $httpMock.flush();
  }));

});