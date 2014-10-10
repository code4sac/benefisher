var express = require('express');
var request = require('request');
var controller = require('../controllers/search');
var router = express.Router();
var Result = require('../models/result');

/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, Result, request).render();
});

module.exports = router;