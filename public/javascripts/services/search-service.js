/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');

/**
 * SearchService - a simple pubsub class.
 * Updates subscribers when search() is called.
 * @param $http
 * @constructor
 */
var SearchService = function ($http, notification) {
  var subscribers = [];
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
    $http.get('/search', { params: params }).success(updateSubscribers).error(httpError);
  };

  /**
   * Update subscribers with search results.
   */
  function updateSubscribers(data, status, headers, config) {
    var numSubscribers = subscribers.length;
    for (var i = 0; i < numSubscribers; i++) {
      if (typeof subscribers[i] === 'function') {
        subscribers[i](data);
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