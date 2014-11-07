"use strict";

var DAYS_OF_WEEK = {
  'sun': 0,
  'mon': 1,
  'tue': 2,
  'wed': 3,
  'thu': 4,
  'fri': 5,
  'sat': 6
};
var MONTHS_OF_YEAR = {
  'jan': 1,
  'feb': 2,
  'mar': 3,
  'apr': 4,
  'may': 5,
  'jun': 6,
  'jul': 7,
  'aug': 8,
  'sep': 9,
  'oct': 10,
  'nov': 11,
  'dec': 12
};

var OPEN_STATUSES = {
  'OPEN': 'open',
  'CLOSED': 'closed',
  'CLOSING': 'closing'
}


/**
 * Result model
 * The use of 'apply()' is mostly for code organization:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {

  // Use lowercase table names.
  var config = { tableName: 'result' };
  // Model properties
  var properties = {
    name: DataTypes.STRING,
    externalId: DataTypes.STRING,
    lat: DataTypes.DECIMAL(18,12),
    lng: DataTypes.DECIMAL(18,12),
    description: DataTypes.TEXT,
    address: DataTypes.STRING,
    hours: DataTypes.STRING,
    phone: DataTypes.STRING,
    rawPhone: DataTypes.STRING,
    email: DataTypes.STRING,
    url: DataTypes.STRING
  };
  // Model 'instance' methods
  var instanceMethods = {
    toJSON: function() { return toJson.apply(this) },
    equals: function(result) { return equals.apply(this, [result]) },
    setLocation: function(location) { return setLocation.apply(this, [location]) },
    openStatus: function(now) { return getOpenStatus.apply(this, [now]) }
  };
  // Model 'class' methods
  var classMethods = {
    associate: function(models) { return associate.apply(Result, [models]) },
    multiFind: function(toFind) { return multiFind.apply(Result, [toFind]) },
    multiInsert: function(toInserts) { return multiInsert.apply(Result, [toInserts]) }
  };
  // Model getter methods
  // Use getter methods to set up virtual properties.
  var getterMethods = {
    directionsUrl: function() { return getDirectionsUrl.apply(this) },  // String
    phoneUrl: function() { return getPhoneUrl.apply(this) },            // String
    emailUrl: function() { return getEmailUrl.apply(this) },            // String
    hashKey: function() { return getHashKey.apply(this) }               // String
  };
  var methods = {
    instanceMethods: instanceMethods,
    classMethods: classMethods,
    getterMethods: getterMethods
  };

  var Result = sequelize.define("Result", properties, methods, config);
  return Result;

};

/**
 * Convert the instance to JSON
 * @returns {*}
 */
function toJson()
{
  var json = this.values;
  json.directionsUrl = getDirectionsUrl.apply(this);
  json.phoneUrl = getPhoneUrl.apply(this);
  json.emailUrl = getEmailUrl.apply(this);
  json.hashKey = getHashKey.apply(this);
  json.popup = getPopupHtml.apply(this);
  json.openStatus = getOpenStatus.apply(this, [new Date()]);
  return json;
}

/**
 * Whether this result is equal to the given result.
 * @param result
 * @returns {boolean}
 */
function equals(result)
{
  if (result.id && this.getDataValue('id')) {
    return result.id === this.getDataValue('id');
  }
  return result.name.toString() === this.getDataValue('name').toString()
    && result.externalId.toString() === this.getDataValue('externalId').toString()
    && result.lat.toString() === this.getDataValue('lat').toString()
    && result.lng.toString() === this.getDataValue('lng').toString();
}

/**
 * Munge location data from API into results object
 * @param location
 * @returns {setLocation}
 */
function setLocation(location)
{
  var email = location.emails ? location.emails[0] : null;
  this.setDataValue('name', location.name);
  this.setDataValue('externalId', location._id);
  this.setDataValue('lat', truncateFloat(location.coordinates ? location.coordinates[1] : null));
  this.setDataValue('lng', truncateFloat(location.coordinates ? location.coordinates[0] : null));
  this.setDataValue('description', location.description);
  this.setDataValue('address', formatAddress(location));
  this.setDataValue('hours', location.hours);
  this.setDataValue('phone', formatPhone(location));
  this.setDataValue('rawPhone', formatRawPhone(location));
  this.setDataValue('email', email);
  this.setDataValue('url', getUrl(location));
  return this;
}

/**
 * Setup model associaions.
 * @param models
 */
function associate(models) {
  this.hasMany(models.Query, { as: 'Queries', through: 'Queries_Results' });
  this.hasMany(models.Interaction, { as: 'Interactions' });
}

/**
 * Find multiple Results in DB
 * @param toFind
 * @returns {Promise.<Array.<Instance>>}
 */
function multiFind(toFind)
{
  // Initialize search criteria for Results
  var where = generateFindResultsCriteria(toFind);
  return this.findAll(where);
}

/**
 * Insert multiple Results to DB
 * @param toInserts
 * @returns {*}
 */
function multiInsert(toInserts)
{
  var chainer = new sequelize.Utils.QueryChainer;
  // Setup DB saves
  toInserts.forEach(function(toInsert) {
    chainer.add(toInsert.save());
  });
  // Run DB saves
  return chainer.run();
}

/**
 * Format a Google maps directions URL
 * @returns {string}
 */
function getDirectionsUrl()
{
  var address = this.getDataValue('address');
  return 'http://maps.google.com/maps?saddr=Current+Location&daddr=' + encodeURIComponent(address);
}

/**
 * Format a phone url (for smartphone browsers)
 */
function getPhoneUrl()
{
  var rawPhone = this.getDataValue('rawPhone');
  return 'tel: ' + rawPhone;
}

/**
 * Format an email url
 * @returns {string}
 */
function getEmailUrl()
{
  var email = this.getDataValue('email');
  return email ? 'mailto:' + email : null;
}

/**
 * Generates a unique key for each result so that it is easier to find.
 * @returns {string}
 */
function getHashKey() {
  var lat = this.getDataValue('lat');
  var lng = this.getDataValue('lng');
  var name = this.getDataValue('name');
  lat = lat ? lat.toString() : "null";
  lng = lng ? lng.toString() : "null";
  name = name ? name.toString() : "null";
  // Takes the last 4 characters from lat, lng, and name, and the first 4 of name, then combines them to create a unique key.
  return lat.slice(-4) + lng.slice(-4) + name.slice(-4) + name.substring(0, 4);
}

/**
 * Get the location's open status for a given time.
 * @param now
 * @returns {string|false}
 */
function getOpenStatus(now)
{
  var hours = this.getDataValue('hours');
  if ( ! hours) {
    return false;
  }
  var monthRegExp = new RegExp(/((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\w]*)/gi);
  var dayRegExp = new RegExp(/((Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\w]*)/gi);
  var timeRegExp = new RegExp(/\d\d?((([:]\d\d)?\s?(a|p)[m]?)|(\s?(a|p)[m]?))/gi);
  var monthMatches = hours.match(monthRegExp);
  var dayMatches = hours.match(dayRegExp);
  var timeMatches = hours.match(timeRegExp);
  var numMonths = monthMatches ? monthMatches.length : 0;
  var numDays = dayMatches ? dayMatches.length : 0;
  var numTimes = timeMatches ? timeMatches.length : 0;
  // TODO: Add support for more formats.
  // Format 1: START MONTH - END MONTH DoW 8:00 AM to 12:00 PM
  if (numMonths == 2 && numDays == 1 && numTimes == 2) {
    return getOpenStatus_format1(now, monthMatches, dayMatches, timeMatches);
  }
  // Format 2: START DoW-END DoW, 8:00am-5:00pm; PHONE INFO
  if ( ! numMonths && numDays == 2 && numTimes == 2) {
    return getOpenStatus_format2(now, dayMatches, timeMatches);
  }
  // If we don't have a format, return false
  return false;
}

/**
 * Generate 'where' clause for find Results query
 * @param locations
 * @returns {{where: {name: {in: *}, externalId: {in: *}, lat: {in: *}, lng: {in: *}}}}
 */
function generateFindResultsCriteria(results)
{
  var wheres = {
    names: [],
    externalIds: [],
    lats: [],
    lngs: []
  };
  // Compile data to search DB for existing results
  results.forEach(function(result) {
    wheres.names.push(result.name);
    wheres.externalIds.push(result.externalId);
    wheres.lats.push(result.lat);
    wheres.lngs.push(result.lng);
  });

  // Compile DB search criteria
  return {
    where: {
      name: { in: wheres.names },
      externalId: { in: wheres.externalIds },
      lat: { in: wheres.lats },
      lng: { in: wheres.lngs }
    }
  };
}

/**
 * Format a location's street address.
 * @param location
 * @returns {string}
 */
function formatAddress(location)
{
  var city = location.address.city;
  var state = location.address.state;
  var street = location.address.street;
  var zip = location.address.zip;
  return street + ', ' + city + ', ' + state + ' ' + zip;
}

/**
 * Format a telephone number
 * @param location
 * @returns {string}
 */
function formatPhone(location)
{
  var phones = getPhones(location);
  if ( ! phones) {
    return null;
  }
  var rawPhone = phones.number;
  var extension = phones.extension;
  // For simplicity, only attempt to format phone numbers that are just 10 plain digits.
  if (rawPhone.match(/^[0-9]{10}$/)) {
    var phone = '(' + rawPhone.substr(0, 3) + ') ' + rawPhone.substr(3,3) + '-' + rawPhone.substr(6,4);
  }
  return (phone ? phone : rawPhone) + (extension ? ' ' + extension : '');
}

/**
 * Format a phone number for use in a link.
 * @param location
 * @returns {*}
 */
function formatRawPhone(location)
{
  var phones = getPhones(location);
  if ( ! phones) {
    return null;
  }
  var rawPhone = phones.number;
  var extension = phones.extension;
  return rawPhone + (extension ? ',' + extension.replace(/[^0-9]/g, '') : '');
}

/**
 * Get phones array from location
 * @param location
 * @returns {location.phones|*}
 */
function getPhones(location)
{
  return location.phones ? location.phones[0] : (location.phones_attributes ? location.phones_attributes[0] : false);
}

/**
 * Get URL from location
 * @param location
 * @returns {*}
 */
function getUrl(location)
{
  if (location.urls) {
    return location.urls[0] ? location.urls[0] : location.urls;
  } else {
    return null;
  }
}

/**
 * Generate the HTML for a popup for a result.
 * TODO: Use a jade template for this.
 * @returns {string}
 */
function getPopupHtml()
{
  var name = this.getDataValue('name');
  var address = this.getDataValue('address');
  return '<h4>' + name + '</h4><h5>' + address + '</h5>';
}

/**
 * Truncates our coordinates to 12 digits after the decimal place.
 *
 * ex:
 *    12.1234567890123 gets transformed to 12.123456789012
 *    12.123 gets transformed to 12.123000000000
 * @param floatCoordinate raw coordinate with possibly 12+ decimal places.
 * @returns Coordinate with 12 decimal places, in float format
 */
function truncateFloat (floatCoordinate) {

  if (floatCoordinate) {
    var truncatedCoordinateString = floatCoordinate.toFixed(12);
    return parseFloat(truncatedCoordinateString);
  } else {
    return null;
  }

}

/**
 * Create a Date object for today's date with the time set to the given time string.
 * @param now
 * @param timeString
 * @returns {Date}
 */
function standardizeTime(now, timeString)
{
  // Dirty clone of Date param
  var date = new Date(now.getTime());
  var colonIndex = timeString.indexOf(':');
  var mins;
  var hoursMatches = timeString.match(new RegExp(/^\d\d?/));
  var hours = hoursMatches[0];
  if (colonIndex < 0) {
    // eg 4 pm
    mins = 0;
  }else {
    // eg 12:00 pm
    mins = timeString.substring(colonIndex + 1, colonIndex + 3);
  }
  // Convert hours to military time (based on a/p)
  hours = timeString.toLowerCase().match('p') ? parseInt(hours) + 12 : parseInt(hours);
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
}

/**
 * Determine whether a location is open if it has the following hours string format:
 * START MONTH - END MONTH DoW 8:00 AM to 12:00 PM
 * @param now
 * @param months
 * @param days
 * @param times
 * @returns {string}
 */
function getOpenStatus_format1(now, months, days, times)
{
  var nowDayOfWeek = now.getDay();
  var nowMonth = now.getMonth();
  var startTime = standardizeTime(now, times[0]);
  var endTime = standardizeTime(now, times[1]);
  var dayOfWeek = DAYS_OF_WEEK[days[0].toLowerCase().substr(0,3)];
  var startMonth = MONTHS_OF_YEAR[months[0].toLowerCase().substr(0,3)];
  var endMonth = MONTHS_OF_YEAR[months[1].toLowerCase().substr(0,3)];
  if (nowMonth < startMonth
    || nowMonth > endMonth
    || nowDayOfWeek != dayOfWeek
    || now < startTime
    || now > endTime ) {
    return OPEN_STATUSES.CLOSED;
  }
  if (Math.floor(Math.abs(endTime - now) / 60000) < 60) {
    return OPEN_STATUSES.CLOSING;
  } else {
    return OPEN_STATUSES.OPEN;
  }
}

/**
 * Determine whether a location is open if it has the following hours string format:
 * START DoW-END DoW, 8:00am-5:00pm; PHONE INFO
 * @param now
 * @param days
 * @param times
 * @returns {string}
 */
function getOpenStatus_format2(now, days, times)
{
  var nowDayOfWeek = now.getDay();
  var startDayOfWeek = DAYS_OF_WEEK[days[0].toLowerCase().substr(0,3)];
  var endDayOfWeek = DAYS_OF_WEEK[days[1].toLowerCase().substr(0,3)];
  var startTime = standardizeTime(now, times[0]);
  var endTime = standardizeTime(now, times[1]);
  if (nowDayOfWeek < startDayOfWeek
    || nowDayOfWeek > endDayOfWeek
    || now < startTime
    || now > endTime) {
    return OPEN_STATUSES.CLOSED;
  }
  if (Math.floor(Math.abs(endTime - now) / 60000) < 60) {
    return OPEN_STATUSES.CLOSING;
  } else {
    return OPEN_STATUSES.OPEN;
  }
}