/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');

/**
 * SearchService - a simple pubsub class.
 * Updates subscribers when search() is called.
 * @param $http
 * @param $timeout
 * @param notification
 * @constructor
 */
var SearchService = function ($http, $timeout, notification) {
  var results = [];
  var subscribers = [];
  var ignoreList = {};
  var params = {};
  var timerPromise;
  var searchPending = false;
  /**
   * Allows subscribers to subscribe with their update function.
   * @param updateFunction
   */
  this.subscribe = function (updateFunction) {
		subscribers.push(updateFunction);
  };

  /**
   * Gather search params from subscribers, query the server, then publish updated results to subscribers.
   * @param newParams
   */
  this.search = function (newParams) {
    updateParams(newParams);
    // Only search once every 1/3 second.
    if ( ! searchPending) {
      searchPending = true;
      timerPromise = $timeout(_search, 300);
      timerPromise.then(function() {
        searchPending = false;
      });
    }
  };


  /**
  * Puts an item in an ignore list so that the item is no longer pushed to the subscribers.
  * @param removeItem
  */
  this.remove = function (removeItem) {
	  var id = removeItem.id;

	  // Uses key-value pairs to keep track of all items in the ignore list.
	  ignoreList[id] = removeItem;

	  // Removes the ignored items from the results and then pushes them to the subscribers.
	  removeIgnored();
	  updateSubscribers();
  };

  /**
  * Lets subscribers know that a user clicked on an item.
  * @param selectedItem
  */
  this.selected = function (selectedItem) {
	  var i = results.length;
	  var selectedId = selectedItem ? selectedItem.id : "";
	  // Changes the "selected" property of the selected item in results to true and all others
	  //   to false.
	  while (i--) {
		  if (results[i].id == selectedId)
			results[i].selected = true;
		  else
			results[i].selected = false;
	  }

	  // Will then pass this data to the subscribers.
	  updateSubscribers();
  }

  function _search()
  {
    // TODO: error handler.
    $http.get('/search', { params: params })
      .success(function(data) {
        // Saves the list of data and removes the items that are ignored. Then pushes them
        //   to subscribers.
        results = data;
        removeIgnored();

        //TODO: Needs to combine ranking, then order.
        updateSubscribers();
      })
      .error(httpError);
  }

  /**
  * Goes through the list of data and removes all items that are on the ignore list.
  * @param data
  * @returns data
  */
  function removeIgnored() {
    var i = results.length;

    // Goes through each data item starting from the top.
    while (i--) {
      var id = results[i].id;

      // If the object exists in the ignore list, set its property to be ignored..
      if (ignoreList[id] != undefined) {
        results[i].ignored = true;
      }
    }
  }

  /**
   * Update subscribers with search results. Ignores results that are on the ignore list.
   */
  function updateSubscribers(data, status, headers, config) {
    var numSubscribers = subscribers.length;
    for (var i = 0; i < numSubscribers; i++) {
      if (typeof subscribers[i] === 'function') {
        subscribers[i](results);
      }
    }
  }

  /**
   * Handle an error with our HTTP request.
   * @param data
   * @param status
   * @param headers
   * @param config
   */
  function httpError(data, status, headers, config)
  {
	  notification.error("Uh-oh, there was an error loading data.", { singleton: true });
  }

  /**
   * Update search parameters.
   * @param newParams
   */
  function updateParams(newParams) {
		for(property in newParams) {
			params[property] = newParams[property];
		}
  }

};

services.service('search', ['$http', '$timeout', 'notification', 'neuralnet', SearchService]);