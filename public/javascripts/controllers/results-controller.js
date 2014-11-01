/**
 * Created by anthony on 9/26/14.
 */

/**
 * ResultsController
 * @param $scope
 * @param $location
 * @param search
 * @param notification
 * @param interaction
 * @constructor
 */
var ResultsController = function ($scope, $location, search, notification, interaction)
{

  /**
   * Interaction targets
   * @type {{HIDE: string, LIKE: string, PHONE: string, LINK: string, DIRECTIONS: string, EMAIL: string}}
   * @private
   */
  var _TARGETS = {
    HIDE: 'hide',
    LIKE: 'like',
    PHONE: 'phone',
    LINK: 'link',
    DIRECTIONS: 'directions',
    EMAIL: 'email',
    EXPAND: 'expand'
  };

  // Expose properties to $scope
  $scope.waitingOnPromise = false;
  $scope.results = [];
  $scope.TARGET = _TARGETS;

  var self = this;

  // Expose public methods
  self.update = _update;

  // Initialize controller
  initResults();

  // Expose methods to scope
  $scope.hideResult = _hideResult;
  $scope.expandResult = _expandResult;
  $scope.interaction = _interaction;

  /**
   * Subscribes to search.
   * Creates a results array inside of the scope object. Each result from user search will
   * be added to this array and be iterated over in the results.jade file.
   */
  function initResults()
  {
    search.subscribe(self.update);
    angular.extend($scope, {
      results: []
    });

    // Adds a click listener to the results controller.
    $scope.onMouseOver = function (item) {
        var result = $scope.results[item];
        // If the result isn't already selected, send it to the service to become selected.
        //  This stops the popup from continually being opened.
        if (!result.selected)
            search.selected($scope.results[item]);
    }
  }

  /**
   * Update results
   * @param data
   * @private
   */
  function _update(data)
  {
    _removeResults();
    if ( ! data.length) {
      $scope.noResults = true;
    } else {
      $scope.noResults = false;
      data.forEach(function (service) {
        // If the service was marked as ignored, it will not be pushed to the list of results.
        if (!service.ignored)
            $scope.results.push(service);
      });
    }
  }

  /**
   * Removes all results from the array by creating a new one.
   */
  function _removeResults()
  {
    $scope.results = [];
  }

  /**
   * Used to hide any div that has had it's 'x' clicked (indicating that the user would like to dismiss the result)
   *
   * We use the splice() method to remove the element and shift the array forward.
   *
   * @param index The index of the result to hide from the user. Used to remove and shift array.
   */
  function _hideResult(index)
  {
    if (_indexIsValid(index)) {
      _interaction($scope.results[index].id, _TARGETS.HIDE);
      search.remove($scope.results[index]);
    }
  }

  /**
   * Mark a given result as 'expanded' and save the interaction.
   * @param index
   * @private
   */
  function _expandResult(index)
  {
    var isExpanded;
    if (_indexIsValid(index)) {
      _interaction($scope.results[index].id, _TARGETS.EXPAND);
      $scope.results.forEach(function(element, i) {
        // Check whether the given result is already expanded
        if ($scope.results[i].expanded && i == index) {
          isExpanded = true;
        }
        // Contract all currently expanded results
        $scope.results[i].expanded = false;
      });
      if ( ! isExpanded) {
        // Expand the selected result
        $scope.results[index].expanded = true;
      }
    }
  }

  /**
   * Save a result interaction
   * @param resultId
   * @param target
   * @param redirect
   */
  function _interaction(resultId, target, redirect)
  {
    var toSave = {
      ResultId: resultId,
      target: target
    };
    interaction.save(toSave).then(function() {
      if (redirect) {
        window.location = redirect;
      }
    });
  }

  /**
   * Whether the index is valid for the current results array
   * @param index
   * @returns {boolean}
   * @private
   */
  function _indexIsValid(index)
  {
    return (index >= 0 && index < $scope.results.length);
  }

};
