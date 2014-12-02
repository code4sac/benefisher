var services = angular.module('benefisher.services');

/**
 * StatsService
 * Sends stats to server.
 * @param $http
 * @constructor
 */
var InteractionService = function ($http, $rootScope) {

  /**
   * Save a stat
   * @param interaction
   */
  this.save = function(interaction) {
    return $http.post('/interactions', { interaction: interaction, query: $rootScope.query });
  };
};

services.service('interaction', ['$http', '$rootScope', InteractionService]);
