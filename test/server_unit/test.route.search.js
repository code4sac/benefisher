var expect = require('chai').expect;
// Mock data
var mockData = [
  {"name":"St. God's Hospital", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "2714 N Street", "zip" : "95816" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.569496, "longitude": -121.471978, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Literal Food Pantry", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "6000 J Street", "zip" : "95819" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.559959, "longitude": -121.420625, "description" : "This is a school", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Super Volunteers", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "1562 Response Road", "zip" : "95815" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.599085, "longitude": -121.434066, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Loaves and Fishes", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "1351 North C Street", "zip" : "95811" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.591044, "longitude": -121.482254, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Free Money", "locations":[{"accessibility" : [ "elevator", "restroom", "ramps" ], "address_attributes" : { "city" : "Rancho Cordova", "state" : "CA", "street" : "2721 Barbera Way", "zip" : "95670" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.594604, "longitude": -121.293896, "description" : "Gives free money!", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Money" } ], "hours" : "Monday-Friday 8am-8pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Veteran Affairs", "locations":[{"accessibility" : [ "elevator", "restroom", "ramps" ], "address_attributes" : { "city" : "Rancho Cordova", "state" : "CA", "street" : "2335 Sierra Madre Ct", "zip" : "95670" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.602476, "longitude": -121.302673, "description" : "Veterans can get business done.", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Military" } ], "hours" : "Monday-Friday 11am-3pm", "languages" : ["English", "Spanish"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "Military" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Something Place", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "10248 Kiefer Blvd", "zip" : "95827" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.542546, "longitude": -121.327161, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "CalFresh" } ], "hours" : "Monday-Saturday 7am-5pm", "languages" : ["English"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "Something" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] },
  {"name":"Emergency Food", "locations":[{"accessibility" : [ "elevator", "restroom" ], "address_attributes" : { "city" : "Sacramento", "state" : "CA", "street" : "7242 Kari Ann Cir", "zip" : "95824" }, "contacts_attributes" : [ { "name" : "Literally D'Boss", "title" : "Director" } ], "latitude" : 38.520703, "longitude": -121.419106, "description" : "This is a description", "emails" : [ "eml@example.org" ], "faxes_attributes" : [ { "number" : "911", "department" : "Something" } ], "hours" : "Monday-Friday 10am-5pm", "languages" : ["Spanish", "English"], "name" : "Admin Test Location", "phones_attributes" : [ { "number" : "7035551212", "vanity_number" : "703555-ABCD", "extension" : "x1223", "department" : "CalFresh" } ], "short_desc" : "This is a short description", "transportation" : "SAMTRANS stops within 1/2 mile.", "urls" : [ "http://codeforamerica.org" ], "services_attributes":[{"name":"Service for Admin Test Location","description":"just a test service","service_areas":["Sacramento County"]}] }] }
];
// Mock the file system
var fs = {};
fs.readFile = function(filename, options, callback)
{
  callback(null, new Buffer(JSON.stringify(mockData)));
};

// Mock request and response objects.
var request = {};
var response = {
  viewData : {},
  json: function(data) {
    this.viewData = data;
  }
};
var controller = require('../../controllers/search');

describe('SearchController.render()', function(done) {

  it('should get all elements the query is empty', function(done) {
    var ctrl = new controller(request, response, fs).render();
    expect(response.viewData.length).to.equal(8);
    done();
  });

  it('should be able to search by a single term', function(done) {
    request.query = { terms: 'god' };
    var ctrl = new controller(request, response, fs).render();
    expect(response.viewData.length).to.equal(1);
    done();
  });

  it('should handle comma separated terms', function(done) {
    request.query = { terms: 'Something,god'};
    new controller(request, response, fs).render();
    expect(response.viewData.length).to.equal(3);
    done();
  });

});