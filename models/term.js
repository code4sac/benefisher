"use strict";

/**
 * Create Interaction model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var config = { tableName: 'term' };
  var Term = sequelize.define("Term", {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Term.hasMany(models.Hidden_Node, { as: 'Hidden_Node', through: models.Term_To_Hidden });
      }
    }
  }, config);
  return Term;
};