var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET home page. */
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

module.exports = router;
