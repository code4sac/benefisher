/**
 * Created by jesserosato on 10/9/14.
 */

/**
 *
 * @param data
 * @returns {*}
 * @constructor
 */
var Result = function(data) {

  var results = [];

  if ( ! data) {
    return results;
  }

  mungeData(data);

  return results;

  /**
   * Munge data from API into usable model.
   * @param service
   */
  function mungeData(service) {
    var name = service.name;
    var numLocations = service.locations.length;
    for (var i = 0; i < numLocations; i++) {
      var location = service.locations[i];
      name = location.name ? location.name : name;
      var lat = location.latitude;
      var lng = location.longitude;
      var desc = location.description;
      var address = formatAddress(location);
      var hours = location.hours;
      var url = location.urls;
      var phone = formatPhone(location);
      var phoneUrl = formatPhoneUrl(location);
      var email = location.emails[0];
      var emailUrl = 'mailto:' + email;
      var directionsUrl = 'http://maps.google.com/maps?saddr=Current+Location&daddr=' + encodeURIComponent(address);
      var popup = '<h4>' + name + '<h4>\n<h5>' + desc + '</h5>\n<h5>' + hours + '</h5>';
      var result = {
        name: name,
        lat: lat,
        lng: lng,
        description: desc,
        address: address,
        directionsUrl: directionsUrl,
        hours: hours,
        phone: phone,
        phoneUrl: phoneUrl,
        email: email,
        emailurl: emailUrl,
        url: url,
        popup: popup
      };
      results.push(result);
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

}

module.exports = Result;