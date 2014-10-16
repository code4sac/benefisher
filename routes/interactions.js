var express = require('express');
var controller = require('../controllers/interactions');
var models = require('../models');
var Interaction = models.Interaction;
var router = express.Router();

/* GET search results */
router.post('/', function(req, res) {
  new controller(req, res, Interaction).render();
});


module.exports = router;