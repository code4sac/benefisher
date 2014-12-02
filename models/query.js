"use strict";

/**
 * Create Query model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var config = { tableName: 'query' };
  var Query = sequelize.define("Query", {
    bounds: DataTypes.STRING,
    terms: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Query.hasMany(models.Result, { as: 'Results', through: 'Queries_Results' });
        Query.hasMany(models.Interaction, { as: 'Interactions' });
      }
    }
  }, config);

  return Query;

};