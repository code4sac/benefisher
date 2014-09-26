var expect = chai.expect;

describe('MapController', function(done) {

  var scope, ctrl;

  // Setup: include benefisher module;
  beforeEach(module('benefisher'));

  // Defaults
  it('should create map defaults', inject(function($controller) {
    scope = {};
    ctrl = $controller('MapController', {$scope:scope});
    // Defaults should be an object
    expect(scope.defaults).to.be.an('object');
    // Defaults must contain the tileLayer property.
    expect(scope.defaults.tileLayer).to.be.a('string');
    expect(scope.defaults.tileLayer.length).to.be.above(0);
  }));

  // Center
  it ('should create map center', inject(function($controller) {
    scope = {};
    ctrl = $controller('MapController', {$scope:scope});
    // Center should be an object
    expect(scope.center).to.be.an('object');
    // Center must have lat and lng.
    expect(scope.center.lat).to.be.an('number');
    expect(scope.center.lng).to.be.an('number');


  }));

  // Markers
  // Controls
});