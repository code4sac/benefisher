var express = require('express');
var controller = require('../controllers/search');
var router = express.Router();
var models = require('../models');
var Result = models.Result;
var Query = models.Query;
var Hidden_Node = models.Hidden_Node;
var Term = models.Term;
var Hidden_To_Result = models.Hidden_To_Result;
var Term_To_Hidden = models.Term_To_Hidden;

var request = require('request');
var q = require('q');
var nn = require('../services/neuralnet');

var neuralNet = new nn(Hidden_Node, Hidden_To_Result, Term, Term_To_Hidden, Result, q);


/* GET search results */
router.get('/', function(req, res) {
  new controller(req, res, Result, Query, request, q, neuralNet).render();
});

module.exports = router;
