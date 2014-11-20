var expect = require('chai').expect;
var models = require('../../models')
var Result = models.Result;

// Mock data
var location = {
  "accessibility" : [ "elevator", "restroom" ],
  "address" : {
    "city" : "Sacramento",
    "state" : "CA", "street" : "2714 N Street",
    "zip" : "95816" },
  "contacts_attributes" : [
    {
      "name" : "Literally D'Boss",
      "title" : "Director" }
  ],
  "coordinates" : [-121.471978, 38.569496],
  "latitude" : 38.569496,
  "longitude": -121.471978,
  "description" : "This is a description",
  "email" : "eml@example.org",
  "faxes_attributes" : [
    {
      "number" : "911",
      "department" : "CalFresh"
    }
  ],
  "regular_schedules": [
    {
      "weekday": 1,
      "opens_at": "2000-01-01T08:00:00.000Z",
      "closes_at": "2000-01-01T12:00:00.000Z"
    },
    {
      "weekday": 2,
      "opens_at": "2000-01-01T08:00:00.000Z",
      "closes_at": "2000-01-01T12:00:00.000Z"
    },
    {
      "weekday": 3,
      "opens_at": "2000-01-01T08:00:00.000Z",
      "closes_at": "2000-01-01T12:00:00.000Z"
    },
    {
      "weekday": 4,
      "opens_at": "2000-01-01T08:00:00.000Z",
      "closes_at": "2000-01-01T12:00:00.000Z"
    },
    {
      "weekday": 5,
      "opens_at": "2000-01-01T08:00:00.000Z",
      "closes_at": "2000-01-01T12:00:00.000Z"
    }
  ],
  "languages" : ["English", "Spanish"],
  "name" : "Admin Test Location",
  "phones" : [
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
location2.phones[0].extension = null;
var location3 = JSON.parse(JSON.stringify(location));
location3.phones[0].number = '703-555-1212';
var location4 = JSON.parse(JSON.stringify(location));
location4.name = null;
location4.coordinates[0] = null;
location4.coordinates[1] = null;
var location5 = JSON.parse(JSON.stringify(location));
delete location5.regular_schedules;

describe('Result', function() {

  it('should format the phone number', function() {
    var result = Result.build().setLocation(location);
    expect(result.phone).to.equal('(703) 555-1212 x1223');
  });

  it('should format the phone link for phone numbers with extensions', function() {
    var result = Result.build().setLocation(location);
    expect(result.phoneUrl).to.contain('tel:');
  });

  it('should format the phone link for phone numbers without extensions', function() {
    var result = Result.build().setLocation(location2);
    expect(result.phone).to.equal('(703) 555-1212');
  });

  it('should format the email link', function() {
    var result = Result.build().setLocation(location);
    expect(result.emailUrl).to.contain('mailto:');
  });

  it('should return false open status if no location hours are specified', function() {
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(new Date())).to.equal(false);
  });

  it('should have the correct open status if the location is open', function() {
    // Use Wednesday, 9/3/14 11:00am
    var now = new Date(2014, 8, 3, 11, 00);
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('open');
  });

  it('should have the correct open status if the location is closing soon', function() {
    // Use Wednesday, 9/3/14 4:55pm
    var now = new Date(2014, 8, 3, 11, 55);
    var result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closing');
  });

  it('should have the correct open status if the location is closed (hours)', function() {
    // Use Wednesday, 9/3/14 11:00pm
    var now = new Date(2014, 8, 3, 23, 0);
    var result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have the correct open status if the location is closed (day of week)', function() {
    // Use Saturday, 9/6/14 11:00am
    var now = new Date(2014, 8, 6, 11, 0);
    // Date format 1
    var result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  });

});