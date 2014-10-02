var expect = chai.expect;
var scope, search, leafletData, ctrl;

describe('MapController', function(done) {

  /** SETUP **/
  // Mock controller dependencies.
  beforeEach(createDependencyMocks);
  // Set up the controller object
  beforeEach(inject(function($controller) {
    ctrl = $controller('MapController', { $scope:scope, search: search, leafletData: leafletData });
  }))

  // Defaults
  it('should create map defaults', function() {
    // Defaults should be an object
    expect(scope.defaults).to.be.an('object');
    // Defaults must contain the tileLayer property.
    expect(scope.defaults.tileLayer).to.be.a('string');
    expect(scope.defaults.tileLayer.length).to.be.above(0);
  });

  /** TESTS **/
  // Center
  it ('should create map center', function() {
    // Center should be an object
    expect(scope.center).to.be.an('object');
    // Center must have lat and lng.
    expect(scope.center.lat).to.be.a('number');
    expect(scope.center.lng).to.be.a('number');
  });

  // Markers
  // Controls

  // Events
  it('should call search on map move event', function() {
    scope.fireEvent('leafletDirectiveMap.moveend', {});
    expect(search.search).to.have.been.calledWith({ bounds: '39,-122,37,-120' });
  });
});

function createDependencyMocks()
{
  // Mock scope dependency
  scope = {
    events: {},
    $on: function(eventName, callback) {
      this.events[eventName] = callback;
    },
    fireEvent: function(eventName, event) {
      this.events[eventName](event);
    }
  };
  // Mock search dependency
  search = {
    search: sinon.spy()
  };
  // Mock leafletData dependency
  var bounds = {
    getNorthWest: function() {
      return {
        lat: 39,
        lng: -122
      }
    },
    getSouthEast: function() {
      return {
        lat: 37,
        lng: -120
      }
    }
  };
  var map = {
    getBounds: function() {return bounds; }
  };
  var getMapPromise = {
    then: function(callback) {
      callback(map);
    }
  };
  leafletData = {
    getMap: function() {
      return getMapPromise;
    }
  };
}