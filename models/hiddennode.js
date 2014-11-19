"use strict";

/**
 * Create Query model.
 * @param sequelize
 * @param DataTypes
 * @returns {*}
 */
module.exports = function(sequelize, DataTypes) {
  var config = { tableName: 'Hidden_Node' };
  var HiddenNode = sequelize.define("Hidden_Node", {
    create: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        HiddenNode.hasMany(models.Result, { as: 'Results', through: models.Hidden_To_Result });
        HiddenNode.hasMany(models.Term, { as: 'Terms', through: models.Term_To_Hidden });
      }
    }
  }, config);

  return HiddenNode;

};