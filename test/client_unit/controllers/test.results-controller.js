var expect = chai.expect;

//Maximum results shown to the user.
var MAX_RESULTS_SHOWN = 4;

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

// Mock search dependency
var search = {
  subscribers: [],
  subscribe: function (subscriber) {
    this.subscribers.push(subscriber);
  }
};

// Mock notification dependency
var notification = {};

describe('ResultsController', function (done) {

  var scope, ctrl;

  // Setup: include benefisher module
  beforeEach(module('benefisher'));

  /** SETUP **/
  beforeEach(inject(function ($rootScope, $controller) {
    // Create stub notification info method.
    notification.info = sinon.spy();
    // Create a fresh scope object.
    scope = $rootScope.$new();
    // Initialize the controller with sample data.
    ctrl = $controller('ResultsController', { $scope: scope, search: search, notification: notification });
    ctrl.update(SAMPLE_DATA);
  }));

  it('should subscribe to search', function() {
    expect(search.subscribers).to.include(ctrl.update);
  });

  it('should update the scope when update() is called', function () {
    expect(scope.results).to.be.an('array');
    expect(scope.results.length).to.equal(8);
  });

  it('should accept an empty result set', function() {
    ctrl.update([]);
    expect(scope.results.length).to.equal(0);
  });

  //Remove 1 element from the array normally
  it('should remove an element from the array when told', function () {
    scope.hideResult(1);
    expect(scope.results.length).to.equal(7);
  });

  //Try to remove elements that are out of bounds (larger than array len, below 0, and above max results shown)
  it('should not allow for the removal of an index that is out of bounds', function () {
    scope.hideResult(8);
    expect(scope.results.length).to.equal(8);

    scope.hideResult(-1);
    expect(scope.results.length).to.equal(8);

    scope.hideResult(MAX_RESULTS_SHOWN);
    expect(scope.results.length).to.equal(8);

  });

  //Attempt to remove an element after all are removed
  it('should not allow for results manipulation after none are showing', function () {
    //Clear the results.
    for (var i = 0; i < 8; i++) {
      scope.hideResult(0);
    }
    expect(scope.results.length).to.equal(0);
    scope.hideResult(0);
    expect(scope.results.length).to.equal(0);
  });

});