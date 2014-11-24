var chai = require('chai');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var sinon = require('sinon');
var sinonPromise = require('sinon-promise');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

sinonPromise(sinon);

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
    then: function(successCallback) {
      successCallback(results);
    }
  };
};

var findNoResults = function(results) {
  return {
    then: function (successCallback) {
      successCallback([]);
    }
  };
};

var insertNoResults = function() {
  return {
    then: function(successCallback){
      successCallback([]);
    }
  }
};

var insertAllResults = function(results) {
  return {
    then: function(successCallback){
      successCallback(results);
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

// Mock a query instance
var query = {
  results: [],
  setResults: function(results){
    this.results = results;
    return this;
  }
};

// Mock the query model.
var Query = {
  create: function() {
    return {
      then: function(callback) {
        callback(query);
      }
    }
  }
};

//Mock the NN
var neuralNet = {
  rankResult : function (query, results) {
    return {
      then: function (callback) {
        callback(results);
      }
    }
  }
}
var request;
var q = sinonPromise.Q;
var controller = require('../../controllers/search');

describe('SearchController', function(done) {


  beforeEach(function() {
    // Mock HTTP service
    request = sinon.spy();
    //Allows for q.all promise to become synchronous for testing. Described below. 
    sinon.stub(process, 'nextTick').yields();
  });

  /*
   * Q uses process.nextTick instead of timeout to ensure async behavior in node.
   * This afterEach calls nextTick (), which, as defined above, immediately yields... turning our q.all
   * promise synchronous.
   */
  afterEach(function () {
    process.nextTick.restore();
  });

  it('should make an http request (all results found in DB path)', function(done) {
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    expect(request).to.have.been.called;
    done();
  });

  it('should make an http request (no results found in DB path)', function(done) {
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    expect(request).to.have.been.called;
    done();
  });


  it('should render results on http success (all results found in DB path)', function(done) {
    request = mockRequest;
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(res.viewData.results.length).to.equal(30);
    done();
  });

  it('should render results on http success (no results found in DB path)', function(done) {
    request = mockRequest;
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(res.viewData.results.length).to.equal(30);
    done();
  });

  it('should attempt to save query with results (all results found in DB path)', function(done) {
    request = mockRequest;
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(query.results.length).to.equal(30);
    done();
  });

  it('should attempt to save query with results (no results found in DB path)', function(done) {
    request = mockRequest;
    // Use 'all found in DB' path.
    Result.multiFind = findNoResults;
    Result.multiInsert = insertAllResults;
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(query.results.length).to.equal(30);
    done();
  });

  // Bounds search shouldn't depend on all/no results found in DB paths, which are tested above.
  it('should limit search results by lat/long bounds', function(done) {
    req.query = { bounds: '39.0000,-123.00000,37.40000,-122.4000' };
    request = mockRequest;
    // Use 'all found in DB' path.
    Result.multiFind = findAllResults;
    Result.multiInsert = insertNoResults;
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(res.viewData.results.length).to.equal(8);
    done();
  });

  it('should throw 500 on http error', function(done) {
    request = function(options, callback) {
      callback({ error: "error" }, { statusCode: 500 }, JSON.stringify(mockData));
    };
    new controller(req, res, Result, Query, request, q, neuralNet).render();
    expect(res.statusCode).to.equal(500);
    done();
  });
});

function mockRequest(options, callback) {
  if (options.uri.match(/search/g)) {
    callback(null, { statusCode: 200 }, JSON.stringify(mockData));
  }
  if (options.uri.match(/location/g)) {
    var idMatches = options.uri.match(/locations\/(.*)$/);
    mockData.forEach(function(item) {
      if (item._id == idMatches[1]) {
        callback(null, { statusCode: 200 }, JSON.stringify(item));
      }
    });
  }
}