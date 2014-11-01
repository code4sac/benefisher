"use strict";

/**
 * Result model
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {

  // Use lowercase table names.
  var config = { tableName: 'result' };

  var Result = sequelize.define("Result", {
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
  }, {
    // Use getter methods to set up virtual properties.
    getterMethods: {
      directionsUrl: function() {
        return formatDirectionsUrl(this.getDataValue('address'));
      },
      phoneUrl: function() {
        return formatPhoneUrl(this.getDataValue('rawPhone'));
      },
      emailUrl: function() {
        return formatEmailUrl(this.getDataValue('email'));
      },
      hashKey: function() {
        return generateHashKey(this.getDataValue('lat'), this.getDataValue('lng'), this.getDataValue('name'));
      }
    },
    instanceMethods: {
      toJSON: function () {
        var json = this.values
        json.directionsUrl = formatDirectionsUrl(this.getDataValue('address'));
        json.phoneUrl = formatPhoneUrl(this.getDataValue('rawPhone'));
        json.emailUrl = formatEmailUrl(this.getDataValue('email'));
        json.hashKey = generateHashKey(this.getDataValue('lat'), this.getDataValue('lng'), this.getDataValue('name'));
        json.popup = generatePopupHtml(this.getDataValue('name'), this.getDataValue('address'));
        return json;
      },
      equals: function(result) {

        if (result.id && this.getDataValue('id')) {
          return result.id === this.getDataValue('id');
        }
        return result.name.toString() === this.getDataValue('name').toString()
          && result.externalId.toString() === this.getDataValue('externalId').toString()
          && result.lat.toString() === this.getDataValue('lat').toString()
          && result.lng.toString() === this.getDataValue('lng').toString();
      },
      setLocation: function(location) {
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
    },
    classMethods: {
      associate: function(models) {
        Result.hasMany(models.Query, { as: 'Queries', through: 'Queries_Results' });
        Result.hasMany(models.Interaction, { as: 'Interactions' });
      },
      multiFind: function(toFind) {
        // Initialize search criteria for Results
        var where = generateFindResultsCriteria(toFind);
        return Result.findAll(where);
      },
      multiInsert: function(toInserts) {
        var chainer = new sequelize.Utils.QueryChainer;
        // Setup DB saves
        toInserts.forEach(function(toInsert) {
          chainer.add(toInsert.save());
        });
        // Run DB saves
        return chainer.run();
      }
    }
  }, config);

  return Result;
};

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
 * Format a Google maps directions URL
 * @param address
 * @returns {string}
 */
function formatDirectionsUrl(address)
{
  return 'http://maps.google.com/maps?saddr=Current+Location&daddr=' + encodeURIComponent(address);
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
 * Format a phone url (for smartphone browsers)
 * @param rawPhone
 */
function formatPhoneUrl(rawPhone)
{
  return 'tel: ' + rawPhone;
}

/**
 * Format an email url
 * @param email
 * @returns {string}
 */
function formatEmailUrl(email)
{
  return 'mailto:' + email;
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
 * Generates a unique key for each result so that it is easier to find.
 * @param lat
 * @param lng
 * @param name
 * @returns {string}
 */
function generateHashKey(lat, lng, name) {
  lat = lat ? lat.toString() : "null";
  lng = lng ? lng.toString() : "null";
  name = name ? name.toString() : "null";
  // Takes the last 4 characters from lat, lng, and name, and the first 4 of name, then combines them to create a unique key.
  return lat.slice(-4) + lng.slice(-4) + name.slice(-4) + name.substring(0, 4);
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
 * @param name
 * @param hours
 * @returns {string}
 */
function generatePopupHtml(name, address)
{
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