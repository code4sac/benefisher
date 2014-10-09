var express = require('express');
var fs = require('fs');
var controller = require('../controllers/search');
var router = express.Router();
var Result = require('../models/result');

/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, Result, fs).render();
});

module.exports = router;