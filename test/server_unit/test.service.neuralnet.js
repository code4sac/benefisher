var chai = require('chai');
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
var expect = chai.expect;
var sinon = require('sinon');
var sinonPromise = require('sinon-promise');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
sinonPromise(sinon);

var mockData = require('../data/locations');
var mockQuery = {id: 1, terms: 'Cash'};

var q = sinonPromise.Q;
var neuralnet = require('../../services/neuralnet');

var updateStrength = function (newStrength) {
  return {
    then: function (callback) {
      callback();
    }
  }
};

var updateDatabase = function () {
  return {
    then: function (callback) {
      callback();
    }
  }
}

var findResult = function(result) {
  return {
    then: function (successCallback) {
      successCallback(result);
    }
  }
};

var findNoResult = function(result) {
  return {
    then: function (successCallback) {
      successCallback();
    }
  }
};

var findHiddenNode = function (result) {
  return {
    success: function (successCallBack) {
      successCallBack({id: 101})
    }
  }
}

var findHiddenNodeWithStrength = function (result) {
  return {
    then: function (successCallback) {
      successCallback({HiddenNodeId: 101, strength: 0.5, updateAttributes: updateStrength});
    },
    success: function (successCallback) {
      successCallback({HiddenNodeId: 101, strength: 0.5, updateAttributes: updateStrength});
    }
  }
};

var findMultipleHiddenNodesWithStrength = function (result) {
  return {
    then: function (successCallback) {
      successCallback([{HiddenNodeId: 101, strength: 0.5, updateAttributes: updateStrength},
        {HiddenNodeId: 102, strength: 0.5, updateAttributes: updateStrength}]);
    },
    success: function (successCallback) {
      successCallback([{HiddenNodeId: 101, strength: 0.5, updateAttributes: updateStrength},
        {HiddenNodeId: 102, strength: 0.5, updateAttributes: updateStrength}]);
    }
  }
};

var findTerm = function(findObject) {
  return {
    then: function (successCallback) {
      successCallback([{id: 101}, {id: 102}]);
    }
  }
};

var findNoHiddenNodes = function (hiddenNode) {
  return {
    then: function (successCallback) {
      successCallback([]);
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
  save: function() {
    return {
      success: function(callback) {
        callback();
      }
    }
  },
  setResults: function(results){
    this.results = results;
    return this;
  }
};

var Term = {};
var ConnectionNode = {};
var HiddenNode = {};

describe('NeuralNetwork', function (done) {
  it('should return the same amount of results as it receives (no hidden nodes found)', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.findAll = findNoHiddenNodes;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.rankResult(mockQuery, mockData);
    nnProm.should.eventually.have.length(mockData.length).notify(done);
  });

  it('should return the same amount of results as it receives (1 hidden node found)', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.find = findHiddenNodeWithStrength;
    ConnectionNode.findAll = findHiddenNodeWithStrength;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.rankResult(mockQuery, mockData);
    nnProm.should.eventually.have.length(mockData.length).notify(done);
  });

  it('should return the same amount of results as it receives (multiple hidden node found)', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.find = findMultipleHiddenNodesWithStrength;
    ConnectionNode.findAll = findMultipleHiddenNodesWithStrength;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.rankResult(mockQuery, mockData);
    nnProm.should.eventually.have.length(mockData.length).notify(done);
  });


  it('should return the same results as it receives if no hidden nodes found', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.findAll = findNoHiddenNodes;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.rankResult(mockQuery, mockData);
    nnProm.should.eventually.have.property(0).equal(mockData[0]).notify(done);
  });

  it('should return the same results as it receives if no results found in database', function (done) {
    Result.find = findNoResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.findAll = findNoHiddenNodes;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.rankResult(mockQuery, mockData);
    nnProm.should.eventually.have.property(0).equal(mockData[0]).notify(done);
  });

  it('should not train if results are not found in the database', function (done) {
    Result.find = findNoResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.findAll = findNoHiddenNodes;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.trainQuery(mockQuery, mockData, mockData[3], 1);
    nnProm.should.eventually.be.rejected.notify(done);
  });

  it('should have a more accurate result after training', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findTerm;
    ConnectionNode.findAll = findHiddenNodeWithStrength;
    ConnectionNode.find = findHiddenNodeWithStrength;
    HiddenNode.find = findHiddenNode;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.trainQuery(mockQuery, mockData, mockData[3], 1);
    nnProm.should.eventually.have.property(0).to.have.property('index').equal(3).notify(done);
  });

  it('should have a weight less accurate results lower after training', function (done) {
    Result.find = findResult;
    Term.findOrCreate = findTerm;
    HiddenNode.findAll = findHiddenNode;
    HiddenNode.find = findHiddenNode;
    ConnectionNode.findAll = findHiddenNodeWithStrength;
    ConnectionNode.find = findHiddenNodeWithStrength;
    var nn = new neuralnet(HiddenNode, ConnectionNode, Term, ConnectionNode, Result, q);
    var nnProm = nn.trainQuery(mockQuery, mockData, mockData[3], -1);
    nnProm.should.eventually.have.property(mockData.length - 1).to.have.property('index').equal(3).notify(done);
  });
});