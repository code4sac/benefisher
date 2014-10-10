var request = require('supertest');

// Here we get hold of the express application
var app = require("../../app.js");

describe('GET /', function() { // Describes the
  it('should respond with html', function(done){
    // the request-object is the supertest top level api
    request(app)
      .get('/')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200);
    done();
  });
});