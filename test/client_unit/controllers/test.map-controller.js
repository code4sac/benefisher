var expect = chai.expect;
var scope, search, leafletData, ctrl;

/** TEST CONSTANTS **/
var TEST_NW_LAT = 39;
var TEST_NW_LNG = -122;
var TEST_SE_LAT = 37;
var TEST_SE_LNG = -120;

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

  // Search
  it('should subscribe to search service', function() {
    expect(search.subscribers).to.include(ctrl.update);
  });

  it('should call search on map move event', function() {
    scope.fireEvent('leafletDirectiveMap.moveend', {});
    expect(search.search).to.have.been.calledWith({
      bounds: TEST_NW_LAT + ',' + TEST_NW_LNG + ',' + TEST_SE_LAT + ',' + TEST_SE_LNG
    });
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
    subscribers: [],
    subscribe: function(subscriber) {
      this.subscribers.push(subscriber);
    },
    search: sinon.spy()
  };
  // Mock leafletData dependency
  var bounds = {
    getNorthWest: function() {
      return {
        lat: TEST_NW_LAT,
        lng: TEST_NW_LNG
      }
    },
    getSouthEast: function() {
      return {
        lat: TEST_SE_LAT,
        lng: TEST_SE_LNG
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