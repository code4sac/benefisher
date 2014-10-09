var request = require('supertest');

// Here we get hold of the express application
var app = require("../../app.js");

describe('GET /search', function() { // Describes the
  it('should respond with json', function(done){
    request(app) // the request-object is the supertest top level api
      .get('/search')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done) // note that we're passing the done as parameter to the expect
  });
});