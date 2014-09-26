var request = require('supertest');

// Here we get hold of the express application
var app = require("../app.js");

describe('GET /search', function() { // Describes the
  it('should respond with json', function(done){
    request(app) // the request-object is the supertest top level api
      .get('/search')
      .set('Accept', 'application/json')
      .expect(200, done) // note that we're passing the done as parameter to the expect
      .expect('Content-Type', /json/)
      .expect(responseBodyIsCorrect);

  });
});

function responseBodyIsCorrect(res) {
  if (res.body.length != 4) {
    throw new Error("Response body does not contain the correct number of elements.");
  }
}