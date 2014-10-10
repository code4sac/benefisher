/**
 * Created by jesserosato on 10/9/14.
 */

/**
 * Location model
 * @param data
 * @returns {Array}
 * @constructor
 */
var Result = function(data) {

  var result = {};

  // Make sure we have data to work with.
  if ( ! data) {
    return result;
  }

  mungeData(data);

  return result;

  /**
   * Munge data from API into usable model.
   * @param service
   */
  function mungeData(location) {
    var phone = formatPhone(location);
    var phoneUrl = formatPhoneUrl(location);
    var email = location.emails ? location.emails[0] : null;
    var address = formatAddress(location);
    var latitude = location.coordinates ? location.coordinates[1] : null;
    var longitude = location.coordinates ? location.coordinates[0] : null;
    result = {
      name: location.name,
      lat: latitude,
      lng: longitude,
      description: location.description,
      address: address,
      directionsUrl: 'http://maps.google.com/maps?saddr=Current+Location&daddr=' + encodeURIComponent(address),
      hours: location.hours,
      phone: phone,
      phoneUrl: phoneUrl,
      email: email,
      emailurl: 'mailto:' + email,
      url: location.urls
    };
    result.popup = generatePopupHtml(result);
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
   * Format a telephone URL for mobile devices.
   * @param location
   * @returns {string}
   */
  function formatPhoneUrl(location)
  {
    var phones = getPhones(location);
    if ( ! phones) {
      return null;
    }
    var rawPhone = phones.number;
    var extension = phones.extension;
    return phoneUrl = 'tel: ' + rawPhone + (extension ? ',' + extension.replace(/[^0-9]/g, '') : '');
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
   * Generate the HTML for a popup for a result.
   * TODO: Use a jade template for this.
   * @param result
   */
  function generatePopupHtml(result) {
    return '<h4>' + result.name + '</h4><h5>' + result.hours + '</h5>';
  }

};

module.exports = Result;