var expect = require('chai').expect;
var sinon = require('sinon');

// Mock request and response objects.
var req;
var res = {
  viewData : {},
  statusCode: null,
  json: function(data) {
    this.viewData = data;
  },
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  send: function(data) {
    viewData = data;
  }
};

var request;

var controller = require('../../controllers/stats');

describe('StatsController', function(done) {

  beforeEach(function() {
    req = {
      body: {}
    };
  });

  it('should return created stat and 201 when good data is provided', function(done) {
    req.body.stat = { "test": "data"};
    new controller(req, res).render();
    expect(res.statusCode).to.equal(201);
    expect(res.viewData.test).to.equal("data");
    expect(res.viewData.id).to.be.above(0);
    done();
  });

  it('should throw 400 on bad data', function(done) {
    new controller(req, res).render();
    expect(res.statusCode).to.equal(400);
    done();
  });

});