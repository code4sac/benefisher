var request = require('supertest');
var nock = require('nock');

// Here we get hold of the express application
var app = require("../../app.js");

var baseUrl = 'https://ohana-api-demo.herokuapp.com';
var path = '/api/search';

describe('GET /search', function() {

  it('should respond with json', function(done){
    // Use nock to prevent HTTP requests from actually being sent.
    nock(baseUrl)
      .get(path)
      .reply(200, [], {
        'Content-Type': 'application/json'
      });

    request(app) // the request-object is the supertest top level api
      .get('/search')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done) // note that we're passing the done as parameter to the expect
  });

  it('should respond with 500 when http request fails', function(done) {
    // Use nock to prevent HTTP requests from actually being sent.
    nock(baseUrl)
      .get(path)
      .reply(500, [], {
        'Content-Type': 'application/json'
      });

    request(app) // the request-object is the supertest top level api
      .get('/search')
      .set('Accept', 'application/json')
      .expect(500, done) // note that we're passing the done as parameter to the expect
  });

});