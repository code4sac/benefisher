/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');

/**
 * SearchService
 * - Subscribers use subscribe method to subscribe (duh), SearchPubService subscribes in turn.
 * - Waits for a subscriber to call search method.
 * - Asks each subscriber to refresh their search params by calling refreshSearchParams (expects a promise in return).
 * - Once subscribers have fulfilled promises, collects search params, and queries the server.
 * - Calls update on each subscriber with a promise of the query results.
 */
var SearchService = function ($http) {
  var subscribers = [];
  var params = {};

  /**
   * Allows subscribers to subscribe.
   * Subscribers should implement:
   * - update()
   * - refreshSearchParams() (should return a promise)
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
   * Update subscribers with a promise of search results.
   */
  function updateSubscribers() {
    var promise = $http.get('/search', { params: params });
    var i = subscribers.length;
    while (i--) {
      if (typeof subscribers[i].update === 'function') {
        subscribers[i].update(promise);
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