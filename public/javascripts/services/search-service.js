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
            updateSubscribers();//
        })
        .error(httpError);
  };

  /**
  * Puts an item in an ignore list so that the item is no longer pushed to the subscribers.
  * @param removeItem
  */
  this.remove = function (removeItem) {
      // Grabs 3 attributes from the item to be removed.
      var lat = removeItem.lat.toString();
      var lng = removeItem.lat.toString();
      var name = removeItem.name.toString();
      // Takes the last 4 characters from the above attrs and combines them to create a unique string.
      var latKey = lat.substring(-5);
      var lngKey = lng.substring(-5);
      var nameKey = name.substring(-5);

      // Uses key-value pairs to keep track of all items in the ignore list.
      ignoreList[nameKey + latKey + lngKey] = removeItem;

      // Removes the ignored items from the results and then pushes them to the subscribers.
      removeIgnored();
      updateSubscribers();
  };

  /**
  * Goes through the list of data and removes all items that are on the ignore list.
  * @param data
  * @returns data
  */
  function removeIgnored() {
    var i = results.length;

    // Goes through each data item starting from the top.
    while (i--) {
      // Grabs 3 attributes from the data item.
      var lat = results[i].lat.toString();
      var lng = results[i].lat.toString();
      var name = results[i].name.toString();
      // Takes the last 4 characters from the above attrs and combines them to create a unique string.
      var latKey = lat.substring(-5);
      var lngKey = lng.substring(-5);
      var nameKey = name.substring(-5);

      // If the object exists in the ignore list, remove it from the list of data.
      if (ignoreList[nameKey + latKey + lngKey] != undefined) {
        results.splice(i, 1);
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