var expect = chai.expect;
var scope, search, notification, leafletData, ctrl;

/** TEST CONSTANTS **/
var TEST_NW_LAT = 39;
var TEST_NW_LNG = -122;
var TEST_SE_LAT = 37;
var TEST_SE_LNG = -120;
var TEST_BOUNDS_STRING = TEST_NW_LAT + ',' + TEST_NW_LNG + ',' + TEST_SE_LAT + ',' + TEST_SE_LNG;
var SAMPLE_DATA = [
  {"name":"St. God's Hospital", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "2714 N Street", "zip" : "95816" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.569496, "longitude": -121.471978, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Literal Food Pantry", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "6000 J Street", "zip" : "95819" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.559959, "longitude": -121.420625, "description" : "This is a school", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Super Volunteers", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "1562 Response Road", "zip" : "95815" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.599085, "longitude": -121.434066, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Loaves and Fishes", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "1351 North C Street", "zip" : "95811" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.591044, "longitude": -121.482254, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Free Money", "locations":[{"accessibility" : [ "elevator", "restroom", "ramps" ], "address_attributes" : { "city" : "Rancho Cordova", "state" : "CA", "street" : "2721 Barbera Way", "zip" : "95670" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.594604, "longitude": -121.293896, "description" : "Gives free money!", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Money" } ], "hours" : "Monday-Friday 8am-8pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Veteran Affairs", "locations":[{"accessibility" : [ "elevator", "restroom", "ramps" ], "address_attributes" : { "city" : "Rancho Cordova", "state" : "CA", "street" : "2335 Sierra Madre Ct", "zip" : "95670" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.602476, "longitude": -121.302673, "description" : "Veterans can get business done.", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Military" } ], "hours" : "Monday-Friday 11am-3pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "Military" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Something Place", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "10248 Kiefer Blvd", "zip" : "95827" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.542546, "longitude": -121.327161, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Saturday 7am-5pm", "languages" : ["English"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "Something" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Emergency Food", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "7242 Kari Ann Cir", "zip" : "95824" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.520703, "longitude": -121.419106, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Something" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["Spanish", "English"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] }
];

describe('MapController', function(done) {

  // Mock constants module since the script is hardcoded into scripts.jade and doesn't get loaded.
  angular.module('benefisher.constants', []).constant('constants', {});
  /** SETUP **/
  beforeEach(module('benefisher'));
  // Mock controller dependencies.
  beforeEach(createDependencyMocks);
  // Set up the scope and controller objects
  beforeEach(inject(function($rootScope, $controller) {
    // Create a fresh scope object and stub events-related functions.
    scope = $rootScope.$new();
    angular.extend(scope, {
      events: {},
      $on: function(eventName, callback) {
        this.events[eventName] = callback;
      },
      fireEvent: function(eventName, event) {
        this.events[eventName](event);
      }
    });
    // Instantiate the controller.
    ctrl = $controller('MapController', { $scope:scope, search: search, notification: notification, leafletData: leafletData });
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
  it('should initialize with no markers', function() {
    expect(scope.markers.length).to.equal(0);
  });

  it('should add markers on update', function() {
    ctrl.update(SAMPLE_DATA);
    expect(scope.markers.length).to.equal(8);
  });

  // TODO: Test Controls

  // Search
  it('should subscribe to search service', function() {
    expect(search.subscribers).to.include(ctrl.update);
  });

  it('should call search on map move event with correct parameters', function() {
    scope.fireEvent('leafletDirectiveMap.moveend', {});
    expect(search.search).to.have.been.calledWith({ bounds: TEST_BOUNDS_STRING });
  });

});

/**
 * Create mock objects for tests.
 */
function createDependencyMocks()
{
  // Mock search dependency
  search = {
    subscribers: [],
    subscribe: function(subscriber) {
      this.subscribers.push(subscriber);
    },
    search: sinon.spy()
  };
  // Mock notification dependency
  notification = {
    error: sinon.spy()
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
  var mapPromise = {
    then: function(callback) {
      callback(map);
    }
  };
  leafletData = {
    getMap: function() {
      return mapPromise;
    }
  };
}