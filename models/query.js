"use strict";

module.exports = function(sequelize, DataTypes) {
  var Query = sequelize.define("Query", {
    bounds: DataTypes.STRING,
    terms: DataTypes.STRING
  }, {});

  return Query;
};