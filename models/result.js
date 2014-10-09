/**
 * Created by jesserosato on 10/9/14.
 */

/**
 * Result model
 * @param data
 * @returns {Array}
 * @constructor
 */
var Result = function(data) {

  // Locations to return.
  var locations = [];

  // Make sure we have data to work with.
  if ( ! data || ! data.locations || ! data.locations.length) {
    return locations;
  }

  mungeData(data);

  return locations;

  /**
   * Munge data from API into usable model.
   * @param service
   */
  function mungeData(service) {
    var orgName = service.name;
    var numLocations = service.locations.length;
    for (var i = 0; i < numLocations; i++) {
      var location = service.locations[i];
      var phone = formatPhone(location);
      var phoneUrl = formatPhoneUrl(location);
      var email = location.emails[0];
      var address = formatAddress(location);
      var result = {
        orgName: orgName,
        name: location.name ? location.name : orgName,
        lat: location.latitude,
        lng: location.longitude,
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
      locations.push(result);
    }
  }

  /**
   * Format a location's street address.
   * @param location
   * @returns {string}
   */
  function formatAddress(location)
  {
    var city = location.address_attributes.city;
    var state = location.address_attributes.state;
    var street = location.address_attributes.street;
    var zip = location.address_attributes.zip;
    return street + ', ' + city + ', ' + state + ' ' + zip;
  }

  /**
   * Format a telephone number
   * @param location
   * @returns {string}
   */
  function formatPhone(location)
  {
    var rawPhone = location.phones_attributes[0].number;
    var extension = location.phones_attributes[0].extension;
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
    var rawPhone = location.phones_attributes[0].number;
    var extension = location.phones_attributes[0].extension;
    return phoneUrl = 'tel: ' + rawPhone + (extension ? ',' + extension.replace(/[^0-9]/g, '') : '');
  }

  /**
   * Generate the HTML for a popup for a result.
   * TODO: Use a jade template for this.
   * @param result
   */
  function generatePopupHtml(result) {
    return '<h4>' + result.name + '</h4><h5>' + result.description + '</h5><h5>' + result.hours + '</h5>';
  }

};

module.exports = Result;