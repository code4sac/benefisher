var express = require('express');
var request = require('request');
var controller = require('../controllers/search');
var router = express.Router();
var models = require('../models');
var Result = models.Result;

/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, Result, request).render();
});

module.exports = router;