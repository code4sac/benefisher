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
    create: {
      type: DataTypes.STRING,
      validate: {
        isUnique: function(value, next) {

          HiddenNode.find({
            where: {create: value},
            attributes: ['id']
          })
            .done(function(error, user) {

              if (error)
              // Some unexpected error occured with the find method.
                return next(error);

              if (user)
              // We found a hidden node with this create ID.
              // Pass the error to the next method.
                return next('Email address already in use!');

              // If we got this far, the email address hasn't been used yet.
              // Call next with no arguments when validation is successful.
              next();

            });

        }
      }
    }
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