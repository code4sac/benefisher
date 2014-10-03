/**
 * Created by anthony on 9/26/14.
 */

/**
 * ResultsController
 * @param $scope
 * @param search
 * @param notification
 * @constructor
 */
var ResultsController = function ($scope, search, notification) {

  //Used to trim the results array to display, at maximum, MAX_DISPLAY_RESULTS at a time.
  var MAX_DISPLAY_RESULTS = 4;
  var self = this;
  // Expose public methods
  self.update = _update;

  initResults();

  function _update(data) {
    removeResults();
    if ( ! data.length) {
      notification.info("We couldn't find any services matching your search in this area.<br />" +
        "Try removing some terms from your search, or zoom out on the map to search a wider area.");
      $scope.results = [];
      return;
    }
    data.forEach(function (service) {
      addResult(service);
    });
  }


  /**
   * Subscribes to search.
   * Creates a results array inside of the scope object. Each result from user search will
   * be added to this array and be iterated over in the results.jade file.
   */
  function initResults() {
    search.subscribe(self.update);
    angular.extend($scope, {
      results: []
    })
  }

  /**
   * Adds a service object containing detailed information about it into the results array.
   * @param service - The service and its information to be added to the results window.
   */
  function addResult(service) {
    var name = service.name;
    var lat = service.locations[0].latitude;
    var lng = service.locations[0].longitude;
    var desc = service.locations[0].description;
    var city = service.locations[0].address_attributes.city;
    var state = service.locations[0].address_attributes.state;
    var street = service.locations[0].address_attributes.street;
    var zip = service.locations[0].address_attributes.zip;
    var hours = service.locations[0].hours;
    var urls = service.locations[0].urls;

    $scope.results.push(
      {'name': name,
        'description': desc,
        'address': street + ', ' + city + ', ' + state + ' ' + zip,
        'hours': hours
      }
    );
  }

  /**
   * Removes all results from the array by creating a new one.
   */
  function removeResults() {
    $scope.results = [];
  }

  /**
   * Used to hide any div that has had it's 'x' clicked (indicating that the user would like to dismiss the result)
   *
   * We use the splice() method to remove the element and shift the array forward.
   *
   * @param index The index of the result to hide from the user. Used to remove and shift array.
   */
  $scope.hideResult = function (index) {
    //We remove the clicked element from the array and shift the remaining over.
    if (index >= MAX_DISPLAY_RESULTS || index < 0 || index >= $scope.results.length) {
      return;
    }
    $scope.results.splice(index, 1);
  };
};