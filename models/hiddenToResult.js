"use strict";

/**
 * Create Interaction model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var Hidden_To_Result = sequelize.define("Hidden_To_Result", {
    strength: DataTypes.DECIMAL(12, 10)
  }, {name: {singular: "Hidden_To_Result", plural: "Hiddens_To_Results"}, tableName: "Hiddens_To_Results"});
  return Hidden_To_Result;
};