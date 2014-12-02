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

var q = sinonPromise.Q;
var trainer = require('../../services/trainer');



var findAssociations = function () {

};

var getQueryMock = function () {
  return {
    then: function (callback) {
      callback({
        getResults: function () {
          return {
            then: function (callback) {
              callback([{}]);
            }
          }
        }
      });
    }
  }
};

var getResultMock = function () {
  return {
    then: function (callback) {
      callback([{}]);
    }
  }
};

var neuralNet = {
  trainQuery: function () {
    return {
      then: function (callback) {
        callback();
      }
    }
  }
};

var interactionsToTrain = [];
var Interaction = {
  findAll: function () {
    return {
      then: function (callback) {
        callback(interactionsToTrain);
      }
    }
  }
};
describe('Trainer', function (done) {

  it ('should train positive or negative interactions', function (done) {
    interactionsToTrain = [
      {target: 'like', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'hide', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'phone', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'link', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'directions', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'email', getQuery: getQueryMock, getResult: getResultMock}];
    new trainer(Interaction, q, neuralNet).performJob().should.eventually.equal(6).notify(done);
  });

  it ('should only train positive or negative interactions', function (done) {
    interactionsToTrain = [
      {target: 'like', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'hide', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'expand', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'link', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'expand', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'like', getQuery: getQueryMock, getResult: getResultMock}];
    new trainer(Interaction, q, neuralNet).performJob().should.eventually.equal(4).notify(done);
  });

  it ('should not train if no interactions are found', function (done) {
    interactionsToTrain = [];
    new trainer(Interaction, q, neuralNet).performJob().should.eventually.equal(0).notify(done);
  });

  it ('should not train if only neutral interactions are found', function (done) {
    interactionsToTrain = [{target: 'expand', getQuery: getQueryMock, getResult: getResultMock},
      {target: 'expand', getQuery: getQueryMock, getResult: getResultMock}];
    new trainer(Interaction, q, neuralNet).performJob().should.eventually.equal(0).notify(done);
  });

  it ('should not train if target words are outside of the knowns', function (done) {
    interactionsToTrain = [{target: 'reduce', getQuery: getQueryMock, getResult: getResultMock}];
    new trainer(Interaction, q, neuralNet).performJob().should.eventually.equal(0).notify(done);
  });
});