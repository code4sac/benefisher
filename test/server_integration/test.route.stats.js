var request = require('supertest');

// Here we get hold of the express application
var app = require("../../app.js");

describe('POST /stats', function() {

  it('should respond with json and 201 when good data is provided', function(done){
    request(app) // the request-object is the supertest top level api
      .post('/stats')
      .send({ stat: { data: "test" }})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201, done) // note that we're passing the done as parameter to the expect
  });

  it('should throw 400 when no data is provided', function(done) {
    request(app) // the request-object is the supertest top level api
      .post('/stats')
      .send({ type: 'query', data: {} })
      .set('Accept', 'application/json')
      .expect(400, done); // note that we're passing the done as parameter to the expect
  });

});