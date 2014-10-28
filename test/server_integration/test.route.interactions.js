var request = require('supertest');

// Here we get hold of the express application
var app = require("../../app.js");

process.env.NODE_ENV = 'test';
var models = require('../../models');

describe('POST /interactions', function () {

  it('should respond with json and 201 when good data is provided', function (done) {
    // Dealing with DB code, clear the DB before we begin.
    models.create().complete(function () {
      // Create a result object for the test to use.
      models.Result.create({}).success(function() {
        request(app) // the request-object is the supertest top level api
          .post('/interactions')
          .send({ interaction: { data: "test", ResultId: "1" }})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201, function () {
            done();
          });
      })
    });
  });

  it('should throw 400 when no data is provided', function (done) {
    request(app) // the request-object is the supertest top level api
      .post('/interactions')
      .send({ type: 'query', data: {} })
      .set('Accept', 'application/json')
      .expect(400, done); // note that we're passing the done as parameter to the expect
  });

});