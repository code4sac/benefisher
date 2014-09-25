// Structure for serving JSON from a file in a Node/Express route.
// This code would go in 'routes/routename.js'
var fs = require('fs');
var express = require('express');
var router = express.Router();

/* For GET requests to '/' */
router.get('/', function(req, res) {
  // Load JSON from file.
  fs.readFile('sample_data/sample.json', null, function (err, data) {
    if (err) {
      // Error
      res.status(500).send("Error loading services.");
    } else {
      // Success. Return JSON.
      res.json(JSON.parse(data));
    }
  });
});