var services = angular.module('benefisher.services');

/**
 * StatsService
 * Sends stats to server.
 * @param $http
 * @constructor
 */
var InteractionService = function ($http) {

  /**
   * Save a stat
   * @param interaction
   */
  this.save = function(interaction) {
    return $http.post('/interactions', { interaction: interaction });
  };
};

services.service('interaction', ['$http', InteractionService]);
