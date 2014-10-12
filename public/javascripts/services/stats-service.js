var services = angular.module('benefisher.services');

/**
 * StatsService
 * Sends stats to server.
 * @param $http
 * @constructor
 */
var StatsService = function ($http) {

  /**
   * Stat types
   * @type {{QUERY: string, INTERACTION: string}}
   * @private
   */
  var _STAT_TYPES = {
    QUERY: 'query',
    INTERACTION: 'interaction'
  }

  /**
   * Exposed stat types
   * @type {{QUERY: string, INTERACTION: string}}
   */
  this.STAT_TYPES = _STAT_TYPES;

  /**
   * Save a search query stat
   * @param query
   */
  this.query = function(query) {
    query.type = _STAT_TYPES.QUERY;
    saveStat(query);
  };

  /**
   * Save an interaction stat
   * @param interaction
   */
  this.interaction = function(interaction) {
    interaction.type = _STAT_TYPES.INTERACTION;
    saveStat(interaction);
  }

  /**
   * Save a stat
   * @param stat
   */
  function saveStat(stat) {
    $http.post('/stats', { stat: stat });
  }
};

services.service('stats', ['$http', StatsService]);