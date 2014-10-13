/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');

/**
 * SearchService - a simple pubsub class.
 * Updates subscribers when search() is called.
 * @param $http
 * @param notification
 * @constructor
 */
var SearchService = function ($http, notification) {
  var results = [];
  var subscribers = [];
  var ignoreList = {};
  var params = {};

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
    // TODO: error handler.
    $http.get('/search', { params: params })
        .success(function(data) {
            // Saves the list of data and removes the items that are ignored. Then pushes them
            //   to subscribers.
            results = data;
            removeIgnored();
            updateSubscribers();
        })
        .error(httpError);
  };

  /**
  * Puts an item in an ignore list so that the item is no longer pushed to the subscribers.
  * @param removeItem
  */
  this.remove = function (removeItem) {
      var hashKey = removeItem.hashKey;

      // Uses key-value pairs to keep track of all items in the ignore list.
      ignoreList[hashKey] = removeItem;

      // Removes the ignored items from the results and then pushes them to the subscribers.
      removeIgnored();
      updateSubscribers();
  };

  this.selected = function (selectedItem) {
      console.log(selectedItem);
      console.log(results);
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
      var hashKey = results[i].hashKey;

      // If the object exists in the ignore list, set its property to be ignored..
      if (ignoreList[hashKey] != undefined) {
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
    notification.error("Uh-oh, there was an error loading data.");
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

services.service('search', ['$http', 'notification', SearchService]);