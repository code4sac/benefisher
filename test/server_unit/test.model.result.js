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
  "services": [
    {
      "id": 48,
      "accepted_payments": [],
      "alternate_name": null,
      "audience": null,
      "description": "Provides health services.",
      "eligibility": null,
      "email": null,
      "fees": null,
      "funding_sources": [],
      "how_to_apply": "Call number or apply at business location.",
      "keywords": [
        "Health",
        "Anyone",
        "General",
        "Pregnancy",
        "Women",
        "Men",
        "Child",
        "Adult"
      ],
      "languages": [],
      "name": "Health",
      "required_documents": [],
      "service_areas": [],
      "status": "active",
      "website": null,
      "wait": null,
      "updated_at": "2014-11-18T16:14:13.482-08:00",
      "categories": [
        {
          "id": 166,
          "depth": 0,
          "oe_id": "106",
          "name": "Health",
          "parent_id": null
        },
        {
          "id": 167,
          "depth": 1,
          "oe_id": "106-01",
          "name": "Addiction & Recovery",
          "parent_id": 166
        },
        {
          "id": 168,
          "depth": 2,
          "oe_id": "106-01-01",
          "name": "12-Step",
          "parent_id": 167
        },
        {
          "id": 173,
          "depth": 1,
          "oe_id": "106-02",
          "name": "Dental Care",
          "parent_id": 166
        },
        {
          "id": 174,
          "depth": 1,
          "oe_id": "106-03",
          "name": "End-of-Life Care",
          "parent_id": 166
        },
        {
          "id": 175,
          "depth": 2,
          "oe_id": "106-03-01",
          "name": "Bereavement",
          "parent_id": 174
        },
        {
          "id": 176,
          "depth": 2,
          "oe_id": "106-03-02",
          "name": "Burial & Funeral Help",
          "parent_id": 174
        },
        {
          "id": 195,
          "depth": 1,
          "oe_id": "106-06",
          "name": "Medical Care",
          "parent_id": 166
        },
        {
          "id": 198,
          "depth": 2,
          "oe_id": "106-06-03",
          "name": "Birth Control",
          "parent_id": 195
        },
        {
          "id": 199,
          "depth": 2,
          "oe_id": "106-06-04",
          "name": "Checkup & Test",
          "parent_id": 195
        },
        {
          "id": 204,
          "depth": 3,
          "oe_id": "106-06-04-05",
          "name": "Pregnancy Tests",
          "parent_id": 199
        },
        {
          "id": 206,
          "depth": 2,
          "oe_id": "106-06-05",
          "name": "Maternity Care",
          "parent_id": 195
        },
        {
          "id": 208,
          "depth": 2,
          "oe_id": "106-06-07",
          "name": "Prevent & Treat",
          "parent_id": 195
        },
        {
          "id": 210,
          "depth": 3,
          "oe_id": "106-06-07-02",
          "name": "HIV Treatment",
          "parent_id": 208
        },
        {
          "id": 221,
          "depth": 2,
          "oe_id": "106-06-09",
          "name": "Primary Care",
          "parent_id": 195
        },
        {
          "id": 1,
          "depth": 0,
          "oe_id": "20000",
          "name": "General",
          "parent_id": null
        },
        {
          "id": 2,
          "depth": 1,
          "oe_id": "20001",
          "name": "Anyone in Need",
          "parent_id": 1
        }
      ],
      "contacts": [],
      "phones": [],
      "regular_schedules": [],
      "holiday_schedules": []
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

  it('should return top-level categories', function() {
    var result = Result.build().setLocation(location);
    expect(result.categories.length).to.equal(1);
  })

});