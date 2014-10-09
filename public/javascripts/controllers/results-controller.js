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

  // Initialize $scope.results
  $scope.results = [];
  //Used to trim the results array to display, at maximum, MAX_DISPLAY_RESULTS at a time.
  var MAX_DISPLAY_RESULTS = 4;
  var self = this;
  // Expose public methods
  self.update = _update;

  initResults();

  function _update(data) {
    removeResults();
    if ( ! data.length) {
      $scope.noResults = true;
    } else {
      $scope.noResults = false;
      data.forEach(function (service) {
        $scope.results.push(service);
      });
    }
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
    });
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