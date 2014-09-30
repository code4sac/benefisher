/**
 * Created by jesserosato on 9/29/14.
 */
var services = angular.module('benefisher.services');
services.service('SearchPubSubService', ['$q', '$http', SearchPubSubService]);

/**
 * SearchPubSubService
 * - Subscribers use subscribe method to subscribe (duh).
 * - Waits for a subscriber to call search method.
 * - Asks each subscriber to refresh their search params by calling refreshSearchParams (expects a promise in return).
 * - Once subscribers have fulfilled promises, collects search params, and queries the server.
 * - Calls update on each subscriber with a promise of the query results.
 */
var SearchPubSubService = function ($q, $http) {
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
   */
  this.search = function () {
    params = {};
    requestParams().then(function (results) {
      readParams(results);
      updateSubscribers();
    });

  };

  /**
   * Get search parameters from subscribers.
   * @returns {Promise}
   */
  function requestParams() {
    var i = subscribers.length;
    var promises = [];
    for (i; i > 0;) {
      if (typeof subscribers[i].refreshSearchParams === 'function') {
        promises.push(subscribers[i].refreshSearchParams());
      }
    }
    return $q.all(promises);
  }

  /**
   * Read search parameters into params object.
   * @param results
   */
  function readParams(results) {
    var i = results.length;
    while (i--) {
      for (var property in results[i]) {
        params[property] = data[property];
      }
    }
  }

  /**
   * Update subscribers with a promise of search results.
   */
  function updateSubscribers() {
    var promise = $http.get('/search', { params: params });
    var i = subscribers.length;
    while (i--) {
      if (typeof subscribers[i].update === 'function') {
        subscribers[i].publish(promise);
      }
    }
  }
};

services.factory('SearchPubSubService', ['$q', '$http', SearchPubSubService]);