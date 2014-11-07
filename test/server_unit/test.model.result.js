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
location5.hours = "May - October Wednesday 10:00 AM to 2:00 PM";
var location6 = JSON.parse(JSON.stringify(location));
location6.hours = "January - December Thursday 9:00 AM to 1:00 PM, Saturday 9:00 AM to 1:00 PM"

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

  it('should not try to format malformed phone numbers', function() {
    var result = Result.build().setLocation(location3);
    expect(result.phone).to.equal('703-555-1212 x1223');
  });

  it('should format the email link', function() {
    var result = Result.build().setLocation(location);
    expect(result.emailUrl).to.contain('mailto:');
  });

  it('should generate a unique key', function () {
    var result = Result.build().setLocation(location);
    expect(result.hashKey).to.equal('94961978tionAdmi')
  });

  it('should generate a unique key even if name, lat, and lng are null', function () {
    var result = Result.build().setLocation(location4);
    expect(result.hashKey).to.equal('nullnullnullnull');
  });

  it('should return not null for isOpen if the location string is a known format', function() {
    // Date format 2
    var result = Result.build().setLocation(location);
    expect(result.isOpen).to.not.equal(null);
    // Date format 1
    result = Result.build().setLocation(location5);
    expect(result.isOpen(new Date())).to.not.equal(null);
  });

  it('should return true for isOpen if the location is open', function() {
    // Use Wednesday, 9/3/14 12:00pm
    var now = new Date(2014, 8, 3, 12, 0);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.isOpen(now)).to.equal(true);
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.isOpen(now)).to.equal(true);
  });

  it('should return false for isOpen if the location is closed', function() {
    // Use Wednesday, 9/3/14 11:00pm
    var now = new Date(2014, 8, 3, 23, 0);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.isOpen(now)).to.equal(false);
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.isOpen(now)).to.equal(false);
  });

  it('should have a null isOpen value if the location string is not a known format', function() {
    var result = Result.build().setLocation(location6);
    expect(result.isOpen(new Date())).to.equal(null);
  });
});