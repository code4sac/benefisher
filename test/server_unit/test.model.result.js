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
var location7 = JSON.parse(JSON.stringify(location));
location7.hours = "Monday-Friday, 9-3";
var location8 = JSON.parse(JSON.stringify(location));
location8.hours = "24 hours daily";

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

  it('should return not false open status if the location hours string is a known format', function() {
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(new Date())).to.not.equal(false);
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.openStatus(new Date())).to.not.equal(false);
    // Date format 3
    result = Result.build().setLocation(location7);
    expect(result.openStatus(new Date())).to.not.equal(false);
    // Date format 4
    result = Result.build().setLocation(location8);
    expect(result.openStatus(new Date())).to.not.equal(false);
  });

  it('should have the correct open status if the location is open', function() {
    // Use Wednesday, 9/3/14 11:55pm
    var now = new Date(2014, 8, 3, 11, 55);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(now)).to.equal('open');
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('open');
    // Date format 3
    result = Result.build().setLocation(location7);
    expect(result.openStatus(now)).to.equal('open');
    // Date format 4
    result = Result.build().setLocation(location8);
    expect(result.openStatus(now)).to.equal('open');
  });

  it('should have the correct open status if the location is closing soon', function() {
    // Use Wednesday, 9/3/14 12:15pm
    var now = new Date(2014, 8, 3, 13, 15);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(now)).to.equal('closing');
    // Date format 2
    // Use Wednesday, 9/3/14 4:01pm
    now = new Date(2014, 8, 3, 16, 1);
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closing');
    // Use Wednesday, 9/3/14 4:01pm
    now = new Date(2014, 8, 3, 16, 1);
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closing');
  });

  it('should have the correct open status if the location is closed (format 1, hours)', function() {
    // Use Wednesday, 9/3/14 11:00pm
    var now = new Date(2014, 8, 3, 23, 0);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have the correct open status if the location is closed (format2, hours)', function() {
    // Use Wednesday, 9/3/14 11:00pm
    var now = new Date(2014, 8, 3, 23, 0);
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  })

  it('should have the correct open status if the location is closed (format3, hours)', function() {
    // Use Wednesday, 9/3/14 11:00pm
    var now = new Date(2014, 8, 3, 23, 0);
    // Date format 3
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have the correct open status if the location is closed (format 1, day of week)', function() {
    // Use Saturday, 9/6/14 11:00am
    var now = new Date(2014, 8, 6, 11, 0);
    // Date format 1
    var result = Result.build().setLocation(location5);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have the correct open status if the location is closed (format2, day of week)', function() {
    // Use Wednesday, 9/3/14 11:00am
    var now = new Date(2014, 8, 6, 11, 0);
    // Date format 2
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have the correct open status if the location is closed (format3, day of week)', function() {
    // Use Wednesday, 9/6/14 11:00pm
    var now = new Date(2014, 8, 6, 11, 0);
    // Date format 3
    result = Result.build().setLocation(location);
    expect(result.openStatus(now)).to.equal('closed');
  });

  it('should have a false open status if the location string is not a known format', function() {
    var result = Result.build().setLocation(location6);
    expect(result.openStatus(new Date())).to.equal(false);
  });
});