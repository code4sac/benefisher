var express = require('express');
var controller = require('../controllers/stats');
var router = express.Router();

/* GET search results */
router.post('/', function(req, res) {
  new controller(req, res).render();
});


module.exports = router;