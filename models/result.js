"use strict";

var OPEN_STATUSES = {
  'OPEN': 'open',
  'CLOSED': 'closed',
  'CLOSING': 'closing'
}

var DAYS_OF_WEEK = [];
DAYS_OF_WEEK[1] = 'Mon';
DAYS_OF_WEEK[2] = 'Tue';
DAYS_OF_WEEK[3] = 'Wed';
DAYS_OF_WEEK[4] = 'Thu';
DAYS_OF_WEEK[5] = 'Fri';
DAYS_OF_WEEK[6] = 'Sat';
DAYS_OF_WEEK[7] = 'Sun';


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
    url: DataTypes.STRING,
    regularHours: DataTypes.TEXT,
    holidayHours: DataTypes.TEXT,
    categories: DataTypes.TEXT
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
    multiInsert: function(toInserts) { return multiInsert.apply(Result, [sequelize, toInserts]) }
  };
  // Model getter methods
  // Use getter methods to set up virtual properties.
  var getterMethods = {
    directionsUrl: function() { return getDirectionsUrl.apply(this) },  // String
    phoneUrl: function() { return getPhoneUrl.apply(this) },            // String
    emailUrl: function() { return getEmailUrl.apply(this) },            // String
    categories: function() { return getCategories.apply(this) }
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
  json.regularHours = getRegularHours.apply(this);
  json.holidayHours = getHolidayHours.apply(this);
  json.directionsUrl = getDirectionsUrl.apply(this);
  json.phoneUrl = getPhoneUrl.apply(this);
  json.emailUrl = getEmailUrl.apply(this);
  json.popup = getPopupHtml.apply(this);
  json.openStatus = getOpenStatus.apply(this, [new Date()]);
  json.categories = getCategories.apply(this);
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
  this.setDataValue('name', location.name);
  this.setDataValue('externalId', location.id);
  this.setDataValue('lat', truncateFloat(location.coordinates ? location.coordinates[1] : null));
  this.setDataValue('lng', truncateFloat(location.coordinates ? location.coordinates[0] : null));
  this.setDataValue('description', location.description);
  this.setDataValue('address', formatAddress(location));
  this.setDataValue('hours', location.hours);
  this.setDataValue('phone', formatPhone(location));
  this.setDataValue('rawPhone', formatRawPhone(location));
  this.setDataValue('email', (location.email ? location.email : null));
  this.setDataValue('url', getUrl(location));
  setHours.apply(this, [location]);
  setCategories.apply(this, [location]);

  return this;
}

/**
 * Setup model associaions.
 * @param models
 */
function associate(models) {
  this.hasMany(models.Query, { as: 'Queries', through: 'Queries_Results' });
  this.hasMany(models.Hidden_Node, { as: 'Hidden_Node', through: models.Hidden_To_Result });
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
 * @param sequelize
 * @param toInserts
 * @returns {*}
 */
function multiInsert(sequelize, toInserts)
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
  return rawPhone ? 'tel: ' + rawPhone : null;
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
 * Get the location's open status for a given time.
 * @param now
 * @returns {string|false}
 */
function getOpenStatus(now)
{
  var regularHours = getRegularHours.apply(this);
  var holidayHours = getHolidayHours.apply(this);

  var holidayOpenStatus;
  if (holidayHours && holidayHours.length && (holidayOpenStatus = getHolidayOpenStatus(holidayHours, now))) {
    return holidayOpenStatus;
  }

  if (regularHours && regularHours.length) {
    return getRegularOpenStatus(regularHours, now);
  }
  // If we haven't been able to parse hours yet, we're not going to. Return false.
  return false;
}

/**
 * Generate 'where' clause for find Results query
 * @param results
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
  var address = location.address;
  if ( ! address) {
    return null;
  }
  var city = address.city;
  var state = address.state;
  var street = address.street_1 + (address.street_2 ? ' ' + address.street_2 : '');
  var zip = address.postal_code;
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
  var rawPhone = phones.number.replace(/[^0-9]/g, '');
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
  return location.website ? location.website : null;
}

function setHours(location)
{
  var regHours = location.regular_schedules ? location.regular_schedules : [];
  if (regHours) {
    // Save formatted times in camel case properties.
    regHours = regHours.map(function(hours) {
      hours.opensAt = formatTime(hours.opens_at);
      hours.closesAt = formatTime(hours.closes_at);
      hours.dayOfWeek = DAYS_OF_WEEK[hours.weekday];
      return hours;
    });
  }
  this.setDataValue('regularHours', JSON.stringify(regHours));
  this.setDataValue('holidayHours', JSON.stringify(location.holiday_schedules));
}

function setCategories(location)
{
  var categories = [];
  var classNames = {};
  var topLevelIdRegExp = /^1\d\d$/;
  if (location.services && location.services.length) {
    location.services.forEach(function (service) {
      if (service.categories && service.categories.length) {
        service.categories.forEach(function (category) {
          if (category.oe_id.match(topLevelIdRegExp)) {
            var className = category.name.toLowerCase().replace(' ', '-');
            if ( ! classNames[className]) {
              var newCategory = {
                name: category.name,
                class: className
              };
              categories.push(newCategory);
              classNames[className] = true;
            }
          }
        });
      }
    });
  }
  this.setDataValue('categories', JSON.stringify(categories));
}

/**
 * Format time from a string like the one returned by Date.toString()
 * @param time
 */
function formatTime(time)
{
  var timeRegExp = new RegExp(/(\d?\d):(\d\d)/);
  var timeStr = time.substring(10,16).replace('T',' ');
  var matches = timeStr.match(timeRegExp);
  var hours = matches[1];
  var minutes = matches[2];
  var ampm;
  if (hours >= 12) {
    if (hours != 12) {
      hours -= 12;
    }
    ampm = 'PM';
  } else {
    if (hours == 0) {
      hours = 12;
    }
    ampm = 'AM';
  }
  // Use parseInt for quick strip of leading zeroes from hours
  return parseInt(hours) + ':' + minutes + ' ' + ampm;
}

/**
 * Get regular hours
 * @returns {*}
 */
function getRegularHours()
{
  try {
    return JSON.parse(this.getDataValue('regularHours'));
  } catch(e) {
    return [];
  }

}

/**
 * Get holiday hours
 * @returns {*}
 */
function getHolidayHours()
{
  try {
    return JSON.parse(this.getDataValue('holidayHours'));
  } catch(e) {
    return [];
  }
}

/**
 * Get categories
 * @returns {*}
 */
function getCategories()
{
  try {
    return JSON.parse(this.getDataValue('categories'));
  } catch(e) {
    return [];
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
 *
 * @param holidayHours
 * @param now
 */
function getHolidayOpenStatus(holidayHours, now)
{
  var timeRegExp = /T(\d\d):(\d\d)/;
  var nowDay = now.getDate();
  var nowYear = now.getYear();
  var nowMonth = now.getMonth();
  var status = false;
  holidayHours.forEach(function(hours) {
    var start = new Date(hours.start_date);
    var end = new Date(hours.end_date);
    if (hours.closed) {
      start.setHours(0);
      start.setMinutes(0);
      end.setHours(23);
      end.setMinutes(59);
      if (now >= start && now <= end) {
        status = OPEN_STATUSES.CLOSED;
      }
    } else {
      // If the holiday has open hours, validate that today is this holiday
      if ((nowDay == start.getDate() && nowMonth == start.getMonth() && nowYear == start.getYear())
        || (nowDay == end.getDate() && nowMonth == end.getMonth() && nowYear == end.getYear())) {
        var startMatches = hours.opens_at.match(timeRegExp);
        var endMatches = hours.closes_at.match(timeRegExp);
        start.setHours(startMatches[1]);
        start.setMinutes(startMatches[2]);
        end.setHours(endMatches[1]);
        end.setMinutes(startMatches[2]);
        status = openOrClosedOrClosing(now, start, end);
      }
    }
  });
  return status;
}

/**
 *
 * @param regularHours
 * @param now
 */
function getRegularOpenStatus(regularHours, now)
{
  // API day of week is 1-indexed, and JavaScript Date DoW is 0-indexed;
  var nowDoW = now.getDay() == 0 ? 7 : now.getDay();
  var timeRegExp = /T(\d\d):(\d\d)/;
  var status = false;
  var numHours = regularHours.length;
  var i = 0;
  while (i < numHours && ! status) {
    var hours = regularHours[i];
    i++;
    if (hours.weekday == nowDoW) {
      // If the start and end times are the same, assume the location is open 24 hours.
      if (hours.opens_at == hours.closes_at) {
        return OPEN_STATUSES.OPEN;
      }
      var startMatches = hours.opens_at.match(timeRegExp);
      var endMatches = hours.closes_at.match(timeRegExp);
      // Clone start and end dates from NOW, and then set times
      var start = new Date(now.getTime());
      start.setHours(startMatches[1]);
      start.setMinutes(startMatches[2]);
      var end = new Date(now.getTime());
      end.setHours(endMatches[1]);
      end.setMinutes(endMatches[2]);
      status = openOrClosedOrClosing(now, start, end);
    }
  }
  return status ? status : OPEN_STATUSES.CLOSED;
}

function openOrClosedOrClosing(now, start, end)
{
  if (now >= start && now <= end) {
    return openOrClosing(now, end);
  } else {
    return OPEN_STATUSES.CLOSED;
  }
}

/**
 * Determine whether now is < 60 minutes before endTime.
 * @param now
 * @param endTime
 * @returns {string}
 */
function openOrClosing(now, endTime)
{
  var nowStr = now.toString();
  var end = endTime.toString();
  var diff = Math.floor((endTime - now) / 60000);
  if ( diff < 60 && diff > 0) {
    return OPEN_STATUSES.CLOSING;
  } else {
    return OPEN_STATUSES.OPEN;
  }
}
