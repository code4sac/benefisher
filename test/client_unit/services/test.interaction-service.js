var expect = chai.expect;

describe('Interaction Service', function() {

  var $httpMock;

  // Search url with test parameters (see mockCtrl).
  var url = '/interactions';

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

  it('should make http request when an interaction is saved', inject(function(interaction) {
    $httpMock.expectPOST(url);
    interaction.save({result: '123', type: 'click', target: 'phone'});
    $httpMock.flush();
  }));

});
