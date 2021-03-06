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
  var expandedResultIndices = [];

  // Expose public methods
  self.update = _update;

  // Initialize controller
  initResults();

  // Expose methods to scope
  $scope.hideResult = _hideResult;
  $scope.expandResult = _expandResult;
  $scope.interaction = _interaction;
  $scope.like = _like;
  $scope.minimizeResult = _minimizeResult;

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
    // Make sure we have a valid index
    if ( ! _indexIsValid(index)) {
      return;
    }

    var subIndex = expandedResultIndices.indexOf(index);
    if (subIndex >= 0) {
      // Case 1: Contract an open result.
      expandedResultIndices.splice(subIndex, 1);
      // If that was the last open result, remove 'inactive' from all results
      if ( ! expandedResultIndices.length) {
        $scope.results.forEach(function(element, i) {
          // Contract all results
          $scope.results[i].expanded = false;
          // Remove 'inactive' from all results
          $scope.results[i].inactive = false;
        });
      } else {
        $scope.results[index].expanded = false;
        $scope.results[index].inactive = true;
      }
    } else {
      // Case 2: Expand a result
      expandedResultIndices.push(index);
      // If this is the first expanded result, make all other results inactive
      if (expandedResultIndices.length == 1) {
        $scope.results.forEach(function(element, i) {
          $scope.results[i].inactive = true
        });
      }
      $scope.results[index].expanded = true;
      $scope.results[index].inactive = false;
    }
  }

  function _minimizeResult(index)
  {
    if (_indexIsValid(index)) {
      search.minimize($scope.results[index]);
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
        window.open(redirect);
      }
    });
  }

  function _like(index)
  {
    var resultId = $scope.results[index].id;
    // Don't save the interaction if the user is 'unliking' the result.
    // TODO: Actually unlike results (save to DB)
    if ( ! $scope.results[index].liked) {
      _interaction(resultId, _TARGETS.LIKE);
    }
    $scope.results[index].liked = ! $scope.results[index].liked;
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
