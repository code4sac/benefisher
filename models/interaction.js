"use strict";

/**
 * Create Interaction model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var config = { tableName: 'interaction' };
  var Interaction = sequelize.define("Interaction", {
    target: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Interaction.hasOne(models.Result);
      }
    }
  }, config);

  return Interaction;
};