var expect = chai.expect;
// Test data
var locations = locations;
var results;

describe('Search Service', function() {

  var mockCtrl, $httpMock, notification;

  // Search url with test parameters (see mockCtrl).
  var url = '/search?testParam=testValue';

  /** SETUP **/
  // Load the benefisher.services module
  beforeEach(module('benefisher.services'));

  // Setup a mock controller
  beforeEach(function() {
    mockCtrl = {
      params: { testParam: 'testValue' },
      update: sinon.spy()
    };
  });

  // Inject the $httpBackend service for mocking http requests
  beforeEach(inject(function ($httpBackend) {
    // Convert test data
    results = convertTestData(locations);
    $httpMock = $httpBackend;
    $httpMock.when('GET', url).respond(results);
  }));

  // Setup mock notification service
  beforeEach(inject(function(_notification_) {
    notification = _notification_;
    notification.error = sinon.spy();
  }));

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
    expect(mockCtrl.update).to.have.been.calledWith(results);
  }));

  it('should create an error notification on an http error', inject(function(search) {
    $httpMock.expectGET(url).respond(400);
    search.subscribe(mockCtrl.update);
    search.search(mockCtrl.params);
    $httpMock.flush();
    expect(notification.error).to.have.been.called;
  }));

  it('should mark a given result as ignored', inject(function(search) {
    $httpMock.expectGET(url);
    search.subscribe(mockCtrl.update);
    search.remove(results[0]);
    search.search(mockCtrl.params);
    $httpMock.flush();
    results[0].ignored = true;
    expect(mockCtrl.update).to.have.been.calledWith(results);
  }));

});

/**
 * Convert raw API locations to Result models.
 * @param locations
 * @returns {Array}
 */
function convertTestData(locations)
{
  var results = [];
  locations.forEach(function(location, index) {
    // Use a dummy id value.
    result = { id: location._id };
    results.push(result);
  });
  return results;
}