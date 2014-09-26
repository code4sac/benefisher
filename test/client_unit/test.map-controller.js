describe('MapController', function(done) {

  var scope, ctrl, $httpBackend;

  // Setup: include benefisher module;
  beforeEach(module('benefisher'));

  // Defaults
  it('should create map defaults', inject(function($controller) {
    scope = {};
    ctrl = $controller('MapController', {$scope:scope});
    // Defaults should be an object
    expect(scope.defaults).toBeDefined();
    // Defaults must contain the tileLayer property.
    expect(scope.defaults.tileLayer).toBeDefined();
    expect(scope.defaults.tileLayer.length).toBeGreaterThan(0);
  }));

  // Center
  it ('should create map center', inject(function($controller) {
    scope = {};
    ctrl = $controller('MapController', {$scope:scope});
    // Center should be an object
    expect(scope.center).toBeDefined();
    // Center must have lat and lng.
    expect(scope.center.lat).toBeDefined();
    expect(scope.center.lng).toBeDefined();
  }));

  // Markers
  // Controls
});