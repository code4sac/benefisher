var express = require('express');
var router = express.Router();
// Load environment variables
var dotenv = require('dotenv');
dotenv.load();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Benefisher',
    mapboxId: process.env.MAPBOX_ID,
    mapboxToken: process.env.MAPBOX_TOKEN
  });
});

module.exports = router;