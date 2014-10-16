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

// Mock the Interaction model
var Interaction = {
  data: {},
  save: function() {
    return {
      success: function(callback) {
        callback();
        return {
          error: function() {}
        }
      }
    };
  },
  build: function(data) {
    this.data = data;
    return this;
  },
  setResult: function() {}
}

var request;

var controller = require('../../controllers/interactions');

describe('InteractionsController', function(done) {

  beforeEach(function() {
    req = {
      body: {}
    };
  });

  it('should return created interaction and 201 when good data is provided', function(done) {
    req.body.interaction = { "test": "data", ResultId: "1" };
    new controller(req, res, Interaction).render();
    expect(res.statusCode).to.equal(201);
    expect(res.viewData.test).to.equal("data");
    done();
  });

  it('should throw 400 on no data', function(done) {
    new controller(req, res, Interaction).render();
    expect(res.statusCode).to.equal(400);
    done();
  });

  it('should throw 400 on bad data (no result id)', function(done) {
    req.body.interaction = { "test": "data" };
    new controller(req, res, Interaction).render();
    expect(res.statusCode).to.equal(400);
    done();
  });

});