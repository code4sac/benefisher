"use strict";

// This file has been generated with the sequelize CLI and collects all the models from the models directory and associates them if needed.

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var dotenv    = require("dotenv");
dotenv.load();
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];
config = configure(config);
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

// Refresh dev and test logs each time we start the server.
var firstLog = true;
function log(toLog) {
  if (firstLog) {
    // Sequelize doesn't append newlines to log messages.
    fs.writeFile("logs/db.log", toLog + '\n');
    firstLog = false;
  } else {
    // Sequelize doesn't append newlines to log messages.
    fs.appendFile("logs/db.log", toLog + '\n');
  }
}

/**
 * Load DB configuration from environment variables.
 * Give precedence to AWS_RDS native vars.
 * TODO: Use AWS config instead of doing this in code.
 * @param config
 * @returns {*}
 */
function configure(config) {
  config.database = process.env.process.env.DB_NAME ? process.env.DB_NAME : config.database;
  config.username = process.env.RDS_USERNAME || process.env.DB_USERNAME || config.username;
  config.password = process.env.RDS_PASSWORD || process.env.DB_PASSWORD || config.password;
  config.host = process.env.RDS_HOSTNAME || process.env.DB_HOST || config.host || 'localhost';
  config.port = process.env.DB_PORT || config.port || 3306;
  config.dialect = process.env.DB_DIALECT || config.dialect || 'mysql';
  config.logging = log;
  return config;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.create = function() {
  return db.sequelize.sync({ force: true });
}

// Initialize DB in test env

module.exports = db;