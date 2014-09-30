var express = require('express');
var fs = require('fs');
var controller = require('../controllers/search');
var router = express.Router();

/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, fs).render();
});

module.exports = router;