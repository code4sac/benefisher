var expect = require('chai').expect;
var Result = require('../../models/Result');

// Mock data
var location = {
  "accessibility" : [ "elevator", "restroom" ],
  "address_attributes" : { "city" : "Sacramento",
    "state" : "CA", "street" : "2714 N Street",
    "zip" : "95816" },
  "contacts_attributes" : [
    {
      "name" : "Literally D'Boss",
      "title" : "Director" }
  ],
  "latitude" : 38.569496,
  "longitude": -121.471978,
  "description" : "This is a description",
  "emails" : [ "eml@example.org" ],
  "faxes_attributes" : [
    {
      "number" : "911",
      "department" : "CalFresh"
    }
  ],
  "hours" : "Monday-Friday 10am-5pm",
  "languages" : ["English", "Spanish"],
  "name" : "Admin Test Location",
  "phones_attributes" : [
    {
      "number" : "7035551212",
      "vanity_number" : "703555-ABCD",
      "extension" : "x1223",
      "department" : "CalFresh"
    }
  ],
  "short_desc" : "This is a short description",
  "transportation" : "SAMTRANS stops within 1/2 mile.",
  "urls" : [ "http://codeforamerica.org" ],
  "services_attributes":[
    {
      "name":"Service for Admin Test Location",
      "description":"just a test service",
      "service_areas":["Sacramento County"]
    }
  ]
};
// Create a couple extra locations to test variations
// Dirty deep clone
var location2 = JSON.parse(JSON.stringify(location));
location2.name = null;
location2.phones_attributes[0].extension = null;
var location3 = JSON.parse(JSON.stringify(location));
location3.phones_attributes[0].number = '703-555-1212';

var mockData = { "name":"St. God's Hospital", "locations":[ location, location2, location3 ] };

var results;


describe('Result', function() {

  beforeEach(function() {
    results = new Result(mockData);
  });

  it('should return an array of locations', function() {
    expect(results.length).to.equal(3);
  });

  it('should user the organization name for locations with no name', function() {
    expect(results[1].name).to.equal(results[1].orgName);
  });

  it('should format the phone number', function() {
    expect(results[0].phone).to.equal('(703) 555-1212 x1223');
  });

  it('should format the phone link for phone numbers with extensions', function() {
    expect(results[0].phoneUrl).to.contain('tel:');
  });

  it('should format the phone link for phone numbers without extensions', function() {
    expect(results[1].phone).to.equal('(703) 555-1212');
  });

  it('should not try to format malformed phone numbers', function() {
    expect(results[2].phone).to.equal('703-555-1212 x1223');
  });

  it('should format the email link', function() {
    expect(results[0].emailurl).to.contain('mailto:');
  });

});