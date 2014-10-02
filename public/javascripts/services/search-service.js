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
var SearchService = function ($http) {
  var subscribers = [];
  var params = {};

  /**
   * Allows subscribers to subscribe.
   * Subscribers should implement:
   * - update(data)
   * @param subscriber
   */
  this.subscribe = function (subscriber) {
    subscribers.push(subscriber);
  };

  /**
   * Gather search params from subscribers, query the server, then publish updated results to subscribers.
   * @param newParams
   */
  this.search = function (newParams) {
    updateParams(newParams);
    // TODO: error handler.
    $http.get('/search', { params: params }).then(updateSubscribers);
  };

  /**
   * Update subscribers with search results.
   */
  function updateSubscribers(response) {
    var i = subscribers.length;
    while (i--) {
      if (typeof subscribers[i].update === 'function') {
        subscribers[i].update(response.data);
      }
    }
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

services.service('search', ['$http', SearchService]);