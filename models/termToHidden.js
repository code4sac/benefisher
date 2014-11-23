"use strict";

/**
 * Create Interaction model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var Term_To_Hidden = sequelize.define("Term_To_Hidden", {
    strength: DataTypes.DECIMAL(12, 10)
  }, {name: {singular: "Term_To_Hidden", plural: "Terms_To_Hiddens"}, tableName: "Terms_To_Hiddens"});
  return Term_To_Hidden;
};