var chai = require('chai');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var sinon = require('sinon');

// Mock data
var mockData = require('../data/locations');

// Mock request and response objects.
var req = {
  query: {}
};
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

// TODO: Alter mocks to test case where some results are found in DB and some are not.
var findAllResults = function(results) {
  return {
    success: function(callback) {
      callback(results);
      return {
        error: function() {}
      }
    }
  };
};

var findNoResults = function(results) {
  return {
    success: function (callback) {
      callback([]);
      return {
        error: function () {
        }
      }
    }
  };
};

var insertNoResults = function() {
  return {
    success: function(callback){
      callback([]);
      return {
        error: function() {}
      }
    }
  }
};

var insertAllResults = function(results) {
  return {
    success: function(callback){
      callback(results);
      return {
        error: function() {}
      }
    }
  }
};

var Result = {
  result: {
    equals: function() {
      return true;
    },
    setLocation: function(){
      return this;
    }
  },
  build: function() {
    return this.result;
  }
};

// Mock the query model.
var Query = {
  results: [],
  build: function() {
    return this;
  },
  setResults: function(results){
    this.results = results;
    return this;
  },
  save: function() {

  }
};

var request;

var controller = require('../../controllers/search');

describe('SearchController', function(done) {

  beforeEach(function() {
    // Mock HTTP service
    request = sinon.spy();
    Query.save = sinon.spy();
  });

  it('should make an http request (all results found in DB path)', function(done) {
    new controller(req, res, Result, Query, request).render();
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    expect(request).to.have.been.called;
    done();
  });

  it('should make an http request (no results found in DB path)', function(done) {
    new controller(req, res, Result, Query, request).render();
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    expect(request).to.have.been.called;
    done();
  });


  it('should render results on http success (all results found in DB path)', function(done) {
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request).render();
    expect(res.viewData.length).to.equal(30);
    done();
  });

  it('should render results on http success (no results found in DB path)', function(done) {
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    new controller(req, res, Result, Query, request).render();
    expect(res.viewData.length).to.equal(30);
    done();
  });

  it('should attempt to save query with results (all results found in DB path)', function(done) {
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request).render();
    expect(Query.results.length).to.equal(30);
    expect(Query.save).to.have.been.calledOnce;
    done();
  });

  it('should attempt to save query with results (no results found in DB path)', function(done) {
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    new controller(req, res, Result, Query, request).render();
    expect(Query.results.length).to.equal(30);
    expect(Query.save).to.have.been.calledOnce;
    done();
  });

  // Bounds search shouldn't depend on all/no results found in DB paths, which are tested above.
  it('should limit search results by lat/long bounds', function(done) {
    req.query = { bounds: '39.0000,-123.00000,37.40000,-122.4000' };
    request = function(options, callback) {
      callback(null, { statusCode: 200 }, JSON.stringify(mockData));
    };
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request).render();
    expect(res.viewData.length).to.equal(8);
    done();
  });

  it('should throw 500 on http error', function(done) {
    request = function(options, callback) {
      callback({ error: "error" }, { statusCode: 500 }, JSON.stringify(mockData));
    };
    new controller(req, res, Result, Query, request).render();
    expect(res.statusCode).to.equal(500);
    done();
  });
});