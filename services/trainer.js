var moment = require('moment');
var q;

//Should be taken to a constants file.
var _TARGETS = {
  HIDE: 'hide',
  LIKE: 'like',
  PHONE: 'phone',
  LINK: 'link',
  DIRECTIONS: 'directions',
  EMAIL: 'email',
  EXPAND: 'expand'
};

/**
 * A function factory to return a function object with predefined arguments.
 * @param query
 * @param results
 * @param interactedResult
 * @param change
 * @param neuralNet
 * @returns {Function}
 */
function trainFuncFactory (query, results, interactedResult, change, neuralNet) {
  return function () {
    return neuralNet.trainQuery(query, results, interactedResult, change);
  }
}

var Trainer = function (Interaction, qRecvd, neuralNet) {
  return {
    performJob: function () {
      q = qRecvd;
      var deferred = q.defer();
      trainJob(Interaction, neuralNet).then(function (numTrained) {
        deferred.resolve(numTrained);
      });
      return deferred.promise;
    }
  }
};

/**
 * Used to find the interactions to train, their
 * @returns {*}
 */
function trainJob (Interaction, neuralNet) {
  var deferred = q.defer();
  var functionPromises = [];
  var change = 0;
  //Find all interactions within the last day.
  Interaction.findAll({where: [ 'updatedAt >= "' + moment().subtract(1, 'days').format()] + '"'})
    .then(function (interactions) {
      if (interactions && interactions.length) {
        //Determine the amount of change that needs to be done.
        //Positive interactions indicate a '1' change, negative interaction are a '0' change.
        interactions.forEach(function (interaction) {
          switch (interaction.target) {
            case _TARGETS.LIKE:
            case _TARGETS.PHONE:
            case _TARGETS.LINK:
            case _TARGETS.DIRECTIONS:
            case _TARGETS.EMAIL:
              change = 1;
              break;
            case _TARGETS.HIDE:
              change = -1;
              break;
            default:
              change = 0;
              break;
          }
          //If we have a positive or nevative interaction, we need to train.
          if (change != 0) {
            functionPromises.push(generateFunctionPromise(interaction, change, neuralNet));
          }
        });
        var training = q();
        q.all(functionPromises).then(function (promises) {
          promises.forEach(function (trainPromise) {
            training = training.then(trainPromise);
          });
          training.then(function () {
            //resolve with the number of interactions we trained (doesn't include the neutral interactions).
            var trained = functionPromises.length ? functionPromises.length : 0;
            deferred.resolve(trained);
          });
        });
      } else {
        q.all([]).then(function () {
          deferred.resolve(0);
        });
      }
    }, function (error) {
      deferred.reject(error);
    });
  return deferred.promise;
}

function generateFunctionPromise (interaction, change, neuralNet) {
  var deferred = q.defer();
  interaction.getQuery().then(function (query) {
    query.getResults().then(function (results) {
      interaction.getResult().then(function (selectedResult) {
        deferred.resolve(trainFuncFactory(query, results, selectedResult, change, neuralNet));
      });
    });
  });
  return deferred.promise;
}

module.exports = Trainer;