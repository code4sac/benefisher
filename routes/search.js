var express = require('express');
var controller = require('../controllers/search');
var router = express.Router();
var models = require('../models');
var Result = models.Result;
var Query = models.Query;
var chainer = new models.Sequelize.Utils.QueryChainer;
var request = require('request');

/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, Result, Query, chainer, request).render();
});

module.exports = router;
