var expect = require('chai').expect;
var sinon = require('sinon');

// Mock data
var mockData = require('../data/locations');

// Mock request and response objects.
var req = {};
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

// Mock the result model.
var Result = {
  build: function() {
    return this;
  },
  setLocation: function(data) {
    return this;
  }
};

var request;

var controller = require('../../controllers/search');

describe('SearchController', function(done) {

  beforeEach(function() {
    // Mock HTTP service
    request = sinon.spy();
  });

  it('should make an http request', function(done) {
    new controller(req, res, Result, request).render();
    expect(request).to.have.been.called;
    done();
  });

  it('should render results on http success', function(done) {
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    new controller(req, res, Result, request).render();
    expect(res.viewData.length).to.equal(30);
    done();
  });

  it('should limit search results by lat/long bounds', function(done) {
    req.query = { bounds: '39.0000,-123.00000,37.00000,-119.000' };
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    new controller(req, res, Result, request).render();
    expect(res.viewData.length).to.equal(30);
    done();
  });

  it('should throw 500 on http error', function(done) {
    request = function(options, callback) {
      callback({ error: "error" }, { statusCode: 500 }, JSON.stringify(mockData));
    };
    new controller(req, res, Result, request).render();
    expect(res.statusCode).to.equal(500);
    done();
  });

});