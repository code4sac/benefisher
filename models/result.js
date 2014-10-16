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
    emailurl: DataTypes.STRING,
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
      }
    },
    instanceMethods: {
      toJSON: function () {
        var json = this.values
        json.directionsUrl = formatDirectionsUrl(this.getDataValue('address'));
        json.phoneUrl = formatPhoneUrl(this.getDataValue('rawPhone'));
        json.emailUrl = formatEmailUrl(this.getDataValue('email'));
        json.popup = generatePopupHtml(this.getDataValue('name'), this.getDataValue('hours'));
        return json;
      },
      equals: function(result) {
        if (result.id && this.getDataValue('id')) {
          return result.id === this.getDataValue('id');
        }
        return result.name === this.getDataValue('name')
          && result.externalId === this.getDataValue('externalId')
          && result.lat.toString() === this.getDataValue('lat').toString()
          && result.lng.toString() === this.getDataValue('lng').toString();
      },
      setLocation: function(location) {
        var email = location.emails ? location.emails[0] : null;
        this.setDataValue('name', location.name);
        this.setDataValue('externalId', location._id);
        this.setDataValue('lat', location.coordinates ? location.coordinates[1] : null);
        this.setDataValue('lng', location.coordinates ? location.coordinates[0] : null);
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
      upsert: function(result) {
        var where = {
          where: {
            name: result.name,
            externalId: result.externalId,
            lat: result.lat,
            lng: result.lng
          }
        };
        return this.find(where).success(function(instance) {
          console.log("INSTANCE: ");
          console.log(instance);
          if (instance) {
            // TODO: Log errors
            return instance;
          } else {
            return result.save();
          }
        });
      }
    }
  }, config);

  return Result;
};

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
function generatePopupHtml(name, hours)
{
  return '<h4>' + name + '</h4><h5>' + hours + '</h5>';
}
