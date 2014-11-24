/**
 * Implementation of a multilayer perceptron neural network, using a backpropagation algorithm for training.
 *
 * @param HiddenNode
 * @param HiddenToResult
 * @param Term
 * @param TermToHidden
 * @param Result
 * @param q
 * @constructor
 */
var NeuralNet = function (HiddenNode, HiddenToResult, Term, TermToHidden, Result, q) {

  var trainingConstant = 0.5; //The rate at which we train. 1 is the maximum, and 0 is the minimum.
                              //TODO should be moved to an environment variables file
  var weightedResults = [];   //Final results to be sent to the search controller.

  /**
   *
   * @param userInfo Information regarding the user's search, including: need, situation, and location
   * @param results The results returned by the API for this given combination
   */
  this.rankResult  = function (userInfo, results) {
    var deferred = q.defer();
    var setProm = setupNetwork(userInfo, results);
    weightedResults = [];
    /* Make sure that the network is setup. */
    setProm.then(function() {
      /* Make sure that we have both resultIds and termIds */
      if (!this.termIds.length || !this.resultIds.length) {
        deferred.resolve(results);
      }
      //Get the weights of the results.
      var feedFor = feedForward();
      //Combine the weights received from feedForward and the results that we received from the search controller.
      var combinedResults = createCombinedObject(feedFor, results);
      combinedResults.sort(sortByStrength);

      // Re-associate the sorted strengths with the results array.
      combinedResults.forEach(function(sortedResult) {
        weightedResults.push(results[sortedResult.index]);
      });

      // Resolve promise, which will return the results to the search controller.
      deferred.resolve(weightedResults);
    }, function () {
      //ERROR. should probably be logged. Returns the same results it was given.
      deferred.resolve(results);
    });
    //Return the promise, so that the search controller can wait for rankResult to finish
    return deferred.promise;
  };

  /**
   * Sorts an array based on its strength attribute.
   *
   * Stable sorting is used, meaning that elements with equal strength will retain their index.
   * @param a
   * @param b
   * @returns {number}
   */
  function sortByStrength (a, b) {
      if (a.strength == b.strength) {
        return a.index - b.index;
      } else {
        return b.strength - a.strength;
      }
  }

  /**
   * Merges two objects together. We use this to associate our weights to our results
   *
   * for example:
   *
   *  createCombinedObject([0.1, 0.2, 0.3],[{id: 1, foo: bar}, {id: 2, foo: bar}, {id: 3, foo: bar}]);
   *  returns: [{id: 1, strength: 0.1, index: 0}, {id: 2, strength: 0.2, index: 1}, {id: 1, strength: 0.1, index: 2}]
   * @param object1
   * @param object2
   */
  function createCombinedObject (object1, object2) {
    var combinedResults = [];
    for (var i = 0; i < object1.length; i++) {
      combinedResults.push( {
        'id': object2[i].id,
        'strength': object1[i],
        'index': i
      });
    }
    return combinedResults;
  }

  /**
   * Used to ensure that the array received from an operation is returned as a flatten, single-dimensional array.
   *
   * For example:
   *
   *  flattenData([[1],[2],[3]]); returns [1, 2, 3]
   *  flattenData(1); returns [1]
   *  flattenData() returns []
   * @param dataArray
   * @returns {Array}
   */
  function flattenData(dataArray) {
    var flattenedArray = [];
    if (dataArray instanceof Array) {
      flattenedArray = flattenedArray.concat.apply(flattenedArray, dataArray);
    } else {
      flattenedArray.push(dataArray);
    }
    return flattenedArray;
  }

  /**
   * Used to setup the network in memory. This function grabs the termIds, resultIds, hiddenIds, and then sets up
   * the weight arrays.
   *
   * @param userInfo
   * @param results
   * @returns {*}
   */
  function setupNetwork (userInfo, results) {
    var deferred = q.defer();
    var termResultPromises = [];
    this.termIds = [];
    this.hiddenIds = [];
    this.resultIds = [];

    /* Pushes the promises for getting the term Ids */
    termResultPromises.push(getTermIds(userInfo));
    /* Pushes the promises for getting the result Ids */
    termResultPromises.push(getResultIds(results));

    /* Wait for both the results and terms to be found. */
    q.all(termResultPromises).then(function(data){
      //Ensure that both TermIds and Result Ids are not null.
      if (data[0] && data[1]) {
        this.termIds = flattenData(data[0]);
        this.resultIds = flattenData(data[1]);

        //Grab all the hiddenIds and store the promise
        var hiddenIdPromise = getAllHiddenIds(this.termIds, this.resultIds);

        // Wait for database to pull the hidden Ids relevant to our terms and results.
        hiddenIdPromise.then(function (hiddenIds) {
          this.hiddenIds = hiddenIds;
          //Setup the weight arrays and then wait until their done.
          setupWeightArrays().then(function () {
            //Resolve the promise
            deferred.resolve();
          });
        });
      }
    }, function () {
      //There was an error. TODO should probably be logged.
      deferred.reject();
    });

    return deferred.promise;
  }

  /**
   * Sets up the weight and outgoing arrays to be used for feeding forward and determining the results to send.
   *
   * @returns {*}
   */
  function setupWeightArrays () {
      var deferred = q.defer();
      //Promises for getting the weights from terms to hidden layer and hidden layer to output layer
      var termWeightPromises = [];
      var hiddenWeightPromises = [];
      //Links from each of the relevant terms, hiddens, and results for the given query.
      this.outgoingFromInput = [];
      this.outgoingFromHidden = [];
      this.outgoingFromResults = [];

      //Initialize all of the outgoings to 1 for each term, hidden, and result ids.
      this.termIds.forEach( function (term) {
        this.outgoingFromInput.push(1.0);
      });

      this.hiddenIds.forEach(function (hiddenId) {
        this.outgoingFromHidden.push(1.0);
      });

      this.resultIds.forEach(function (hiddenId) {
        this.outgoingFromResults.push(1.0);
      });

      //Weight matrices.
      this.weightsInputToHidden = [];
      this.weightsHiddenToResults = [];

      //Grabs the strengths from the terms to the hidden layer.
      this.termIds.forEach(function (term) {
        this.hiddenIds.forEach(function (hiddenId) {
          termWeightPromises.push(getStrength(term, hiddenId, 0));
        });
      });

      //Grabs the strengths from the hidden to the resuts layer.
      this.hiddenIds.forEach(function (hiddenId) {
        this.resultIds.forEach(function (resultId) {
          hiddenWeightPromises.push(getStrength(hiddenId, resultId, 1));
        });
      });

      // Wait for all of the getStrength calls to finish from input layer to hidden layer
      q.all(termWeightPromises).then(function (weightsIToH) {
        //Consolidates the weights by hiddenId
        var weightsObjCombined = combineWeights(weightsIToH);
        this.weightsInputToHidden = getObjectValues(weightsObjCombined);

        // Wait for all of the getStrength calls to finish from hidden layer to results layer
        q.all(hiddenWeightPromises).then(function (weightsHToR) {
          //Consolidates the weights by hiddenId
          var hiddenWeightsObj = combineWeights(weightsHToR);
          this.weightsHiddenToResults = getObjectValues(hiddenWeightsObj);

          // Resolve the promise
          deferred.resolve();
        });
      });

      //Return a promise, so that we can wait for the results of this method.
      return deferred.promise;
    }

  /**
   * Returns an array of object keys.
   *
   * for example: getObjectValues({foo: 1, bar: 2, baz: 3}); returns [1, 2, 3]
   * @param object
   * @returns {Array}
   */
  function getObjectValues (object) {
    var objectValues = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        objectValues.push(object[key]);
      }
    }
    return objectValues;
  }

  /**
   * This method 'turns on' the neural network. It activates the termId nodes that are present within the query and
   * calculates the output based on the weights between the layers.
   * @returns {Array}
   */
  function feedForward () {
    var i;
    var j;
    //Activate the nodes corresponding to the terms in the search
    for(i = 0; i < this.termIds.length; i++) {
      this.outgoingFromInput[i] = 1.0;
    }

    this.outgoingFromHidden = calculateOutgoing(this.hiddenIds, this.termIds, this.outgoingFromInput, this.weightsInputToHidden);
    this.outgoingFromResults = calculateOutgoing(this.resultIds, this.hiddenIds, this.outgoingFromHidden, this.weightsHiddenToResults);

    return this.outgoingFromResults;
  }

  /**
   * Calculate the weighted outgoing connections from the fromLayer to the toLayer
   * @param toLayer
   * @param fromLayer
   * @param outgoingFrom
   * @param weights
   * @returns {Array}
   */
  function calculateOutgoing (toLayer, fromLayer, outgoingFrom, weights) {
    var outgoingConnections = [];
    for(var i = 0; i < toLayer.length; i++) {
      var sum = 0.0;
      for (var j = 0; j < fromLayer.length; j++) {
        sum += outgoingFrom[j] * weights[j][i];
      }
      outgoingConnections.push(tanh(sum));
    }
    return outgoingConnections;
  }
  /**
   * Returns all of the hidden ids associated with terms and results.
   */
  function getAllHiddenIds (termIds, resultIds) {
    var deferred = q.defer();
    var termPromises = [];
    var hiddenPromises = [];
    var l1 = {};
    termIds.forEach( function (term) {
      //Find all HiddenIds associated with the terms present
      termPromises.push(TermToHidden.findAll({where : {termId: term}}));
    });
    resultIds.forEach(function (resultId) {
      //Find all HiddenIds associated with the results present.
      hiddenPromises.push(HiddenToResult.findAll({where : {resultId: resultId}}));
    });
    //Wait for all of the hiddenIds associated with the links to be found.
    q.all(termPromises).then(function (termToHiddenLinks) {
      var toHiddenLinks = [];
      //Wait for all of the resultIds associated with the links to be found.
      q.all(hiddenPromises).then(function (hiddenNodeLinks) {
        //Make sure that the links are flattened Arrays
        toHiddenLinks = flattenData(termToHiddenLinks);
        fromHiddenLinks = flattenData(hiddenNodeLinks);

        //Store the relevant HiddenNodeIds
        toHiddenLinks.forEach(function (toLink) {
          l1[toLink.HiddenNodeId] = 1;
        });
        fromHiddenLinks.forEach(function (fromLink) {
          l1[fromLink.HiddenNodeId] = 1;
        });
        var keys;
        if (l1) {
          keys = [];
          for (var key in l1) {
            if (l1.hasOwnProperty(key)) {
              keys.push(key);
            }
          }
        }
        //Resolve with the HiddenNodeIds.
        deferred.resolve(keys);
      });
    });

    return deferred.promise;
  }

  /**
   * Generates a hidden node and relevant linking connections between the terms, results and the
   * newly generated hidden node.
   * @param termIds
   * @param resultIds
   * @returns {*}
   */
  function generateHiddenNode (termIds, resultIds) {
    var deferred = q.defer();
    var hiddenNodeGenPromises = [];

    //Filters any duplicates from terms.
    var newTermIds = termIds.filter(function (elem, pos) {
      return termIds.indexOf(elem) == pos;
    });

    //Sorts the terms by id.
    newTermIds.sort(function(a, b) {
      return b - a;
    });
    var hiddenKey = termIds.join('_');
    //Check if we already have a hiddenNode with these terms.
    HiddenNode.find({where: {create: hiddenKey}}).success(function (hiddenNode) {
      if (!hiddenNode) {
        //If we did not find a node with the terms present, we create a new one.
        HiddenNode.create({create:hiddenKey}).success(function (node){
          termIds.forEach(function (term) {
            //Create a link from terms to hiddens, with strength proportional to the amount of terms present.
            hiddenNodeGenPromises.push(setStrength(term, node.id, 0, (1.0/termIds.length)));
          });

          resultIds.forEach(function (result) {
            //Create a link from hiddens to results, with a default strength of 0.1.
            hiddenNodeGenPromises.push(setStrength(node.id, result, 1, 0.1));
          });

          //Wait for all of the links to be generated.
          q.all(hiddenNodeGenPromises).done(function () {
            deferred.resolve();
          });
        });
      } else {
        //We've already created a hidden node with these terms. No need to create anything else.
        deferred.resolve();
      }
    });
    //Return a promise to allow the calling function to wait for completion.
    return deferred.promise;
  };

  /**
   * Sets the strength of the connection between the fromId and the toId to the strength given.
   *
   * If the connection does not currently exist, it will be created. If it does, its attributes will be updated.
   * @param fromId
   * @param toId
   * @param layer
   * @param strength
   * @returns {*}
   */
  function setStrength (fromId, toId, layer, strength) {
    var deferred = q.defer();
    //Get relevant toAttribute, fromAttribute and table names based on the layer.
    var table = layer == 0 ? TermToHidden : HiddenToResult;
    var fromAttribute = layer == 0 ? 'TermId' : 'HiddenNodeId';
    var toAttribute = layer == 0 ? 'HiddenNodeId' : 'ResultId';
    //Find the connection, if it exists.
    table.find({where: [fromAttribute + "= '" + fromId + "' AND " + toAttribute + "= '" + toId + "'"]}).success(function (connection) {
      if (connection) {
        //If the connection exists, update connection in database
        connection.updateAttributes({strength: strength}).then(function () {
          deferred.resolve();
        });

      } else {
        //connection doesn't currently exist.
        //Create new connection with the strength given.
        var createObject = {strength: strength};
        createObject[fromAttribute] = fromId;
        createObject[toAttribute] = toId;
        table.create(createObject).then(function () {
          deferred.resolve();
        });
      }
    });
    return deferred.promise;
  }

  /**
   * Gets the strength for the desired connection. If the connection does not exist, then a default value is given,
   * based on the layer.
   * @param fromId
   * @param toId
   * @param layer
   * @returns {*}
   */
  function getStrength (fromId, toId, layer) {
    var deferred = q.defer();
    var table = layer == 0 ? TermToHidden : HiddenToResult;
    var fromAttribute = layer == 0 ? 'TermId' : 'HiddenNodeId';
    var toAttribute = layer == 0 ? 'HiddenNodeId' : 'ResultId';

    //If either toId or fromId are null, we set the null attribute to non-existant values to perform the query.
    if (!toId) {
      toId = -1;
    }
    if (!fromId) {
      fromId = -1;
    }
    //Find the connection, if it exisits.
    table.find({where: [fromAttribute + "=" + fromId + " AND " + toAttribute + "=" + toId]}).success(function (link) {
      if (link) {
        //connection exists.
        var resolveObject = {};
        resolveObject[fromId] = link.strength;
        deferred.resolve(resolveObject);
      } else {
        //connection does not exist.
        var resolveObject = {};
        resolveObject[fromId] = layer == 0 ? -0.2 : layer == 1 ? 0 : null;
        deferred.resolve(resolveObject);
      }
    });

    return deferred.promise;
  }

  /**
   * Hyperbolic tangent function, used to derive the weight from one node to another.
   * @param x
   * @returns {number}
   */
  function tanh(x) {
    return (Math.exp(x) - Math.exp(-x))/(Math.exp(x) + Math.exp(-x));
  }

  /**
   * Double precision hyperbolic tangent. Used to derive the error between the desired value and actual.
   * @param y
   * @returns {number}
   */
  function dtanh(y) {
    return 1.0 - (y * y);
  }

  /**
   * Consolidates values associated with the same key into one object.
   *
   * For example: combineWeights({101: 0.2, 101: 0.3, 101: 0.4, 102: 0.2, 102: 0.3});
   *                returns [{101: [0.2, 0.3, 0.4]}, {102: [0.2, 0.3]}]
   * @param weightsObject
   * @returns {{}}
   */
  function combineWeights (weightsObject){
    var weightsObjCombined = {};
    weightsObject.forEach(function(weight) {
      for (var key in weight) {
        if(weight.hasOwnProperty(key)) {
          if(weightsObjCombined[key]) {
            weightsObjCombined[key].push(weight[key]);
          } else {
            weightsObjCombined[key] = [weight[key]];
          }
        }
      }
    });
    return weightsObjCombined;
  }

  /**
   * Fetches the term ids associated with the query.
   * @param fullQuery
   * @returns {*}
   */
  function getTermIds(fullQuery) {
    var deferred = q.defer();
    var location = fullQuery.lat_lng;
    var needs = fullQuery.category;
    var promises = [];
    var termIds = [];
    if (location) {
      promises.push(Term.findOrCreate({where: {name: location}}));
    }
    if (needs) {
      needs = needs.split(',');
      needs.forEach(function (need) {
        promises.push(Term.findOrCreate({where: {name: need}}))
      });
    }
    //Wait for all of the promises to be fulfilled, meaning that the Terms have been found or created.
    q.all(promises).then(function (terms) {
      terms.forEach(function (term) {
        termIds.push(term[0].id);
      });
      deferred.resolve(termIds);
    });

    return deferred.promise;
  }

  /**
   * Get the result Ids associated with the results returned by the search
   * @param results
   * @returns {*}
   */
  function getResultIds (results) {
    var deferred = q.defer();
    var readPromises = [];
    results.forEach(function(result) {
      //Find the result ids in the database.
      if (!result.externalId) {
        result.externalId = -1;
      }
      readPromises.push(Result.find({where: ['externalId = ' + result.externalId + ' AND name= ' + '"' + result.name + '"']}));
    });
    //Wait for all of the results to be found.
    q.all(readPromises).then (function (results) {
      //Ensure that results in the result set are null.
      var noNullResults = checkForNullResults(results);
      if (noNullResults) {
        var resultIds = [];
        results.forEach(function (result) {
          if (result) {
            resultIds.push(result.id);
          }
        });
        if (resultIds.length) {
          deferred.resolve(resultIds);
        } else {
          deferred.resolve();
        }
      } else {
        //There was an error (null result) TODO probably should be logged.
        deferred.reject();
      }
    });

    return deferred.promise;
  }

  /**
   * Iterate through the results and ensure that they are all non-null.
   * @param results
   * @returns {boolean}
   */
  function checkForNullResults(results) {
    if (results.length) {
      for (var i = 0; i < results.length; i++) {
        if (!results[i]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * Updates the database with the strengths calculated in the backpropogation process.
   */
  function updateDatabase () {
    var i;
    var j;

    for (i = 0; i < this.termIds.length; i++) {
      for (j = 0; j < this.hiddenIds.length; j++) {
        setStrength(this.termIds[i], this.hiddenIds[j], 0, this.weightsInputToHidden[i][j]);
      }
    }

    for (i = 0; i < this.hiddenIds.length; i++) {
      for (j = 0; j < this.resultIds.length; j++) {
        setStrength(this.hiddenIds[i], this.resultIds[j], 1, this.weightsHiddenToResults[i][j]);
      }
    }
  }

  /**
   * Implementation of a backpropagation algorithm. This method is used to adjust the network to more adequately
   * reflect the training that it has been given.
   * @param targets
   */
  function backPropagate (targets) {
    var i;
    var j;
    var outputDeltas = [];
    var hiddenDeltas = [];
    var error;
    var change;

    //Calculates the error from the output layer.
    for(i = 0; i < this.resultIds.length; i++) {
      error = targets[i] - this.outgoingFromResults[i];
      outputDeltas[i] = dtanh(this.outgoingFromResults[i]) * error;
    }

    //Calculates the error from the hidden layer to the result layer, using the error previously calculated.
    for (i = 0; i < this.hiddenIds.length; i++) {
      error = 0.0;
      for (j = 0; j < this.resultIds.length; j++) {
        error += outputDeltas[j] * this.weightsHiddenToResults[i][j];
      }
      hiddenDeltas[i] = dtanh(this.outgoingFromHidden[i]) * error;
    }

    //Calculates the error in the weight from the hidden layer to the results, using the previously calculated error.
    for(i = 0; i < this.hiddenIds.length; i++) {
      for (j = 0; j < this.resultIds.length; j++) {
        change = outputDeltas[j] * this.outgoingFromHidden[i];
        this.weightsHiddenToResults[i][j] = this.weightsHiddenToResults[i][j] + trainingConstant * change;
      }
    }

    //Calculates the error from the terms to the hidden layer.
    for(i = 0; i < this.termIds.length; i++) {
      for (j = 0; j < this.hiddenIds.length; j++) {
        change = hiddenDeltas[j] * this.outgoingFromInput[i];
        this.weightsInputToHidden[i][j] += trainingConstant * change;
      }
    }
  };

  /**
   * This method is used to train the network to better reflect the training. Uses a backpropagation algorithm to
   * determine the error, and a training constant to determine how fast to train.
   * @param terms
   * @param results
   * @param selected
   * @param change This indicates what kind of change needs to be made.
   *                'Like' or interactions with buttons = 1
   *                'Expand' = 0.75
   *                'Hide' = -1
   */
  this.trainQuery = function (terms, results, selected, change) {
    var deferred = q.defer();
    var targets = [];
    var foundIndex;
    var i;
    this.termIds = [];
    this.hiddenIds = [];
    this.resultIds = [];

    var termPromise = getTermIds(terms);
    var resultPromise = getResultIds(results);

    // Determine which index the trained result is at.
    for (var i = 0; i < results.length; i++) {
      if (selected.id == results[i].id) {
        foundIndex = i;
        break;
      }
    }

    //TODO Make these nested promises more readable.
    //Waits for all of the term ids to be found.
    termPromise.then(function (termIds) {
      //Waits for all of the result ids to be found.
      resultPromise.then(function (resultIds) {
        this.termIds = flattenData(termIds);
        this.resultIds = flattenData(resultIds);
          //Generate any hidden nodes, if they don't already exist.
          generateHiddenNode(this.termIds, this.resultIds).then(function () {
            //Once the hidden nodes are generated, get the ids associated with them.
            getAllHiddenIds(this.termIds, this.resultIds).then(function (hiddenIds) {
              this.hiddenIds = hiddenIds;
              //Make sure that we have hidden, term, and result ids.
              if (this.hiddenIds && this.termIds && this.resultIds) {
                //Setup the weights for the network in memory.
                setupWeightArrays().then (function () {
                  //Create the network with the current weight
                  feedForward();
                  //Initialize the targets to 0 (meaning that they were not trained)
                  for(i = 0; i < results.length; i++) {
                    targets[i] = 0;
                  }
                  //Change the index of the selected result to the desired change.
                  targets[foundIndex] = change;
                  //Calculate the error and change the weight values in memory.
                  backPropagate(targets);
                  //Update the database to make the changes persistent.
                  updateDatabase();
                  //Combine the new weights with the old results.
                  var returnObject = createCombinedObject(this.weightsHiddenToResults[0], results);
                  //Sort the new object by its strength.
                  returnObject.sort(sortByStrength);
                  //Resolve the promise.
                  deferred.resolve(returnObject);
                });
              } else { //If we don't have results, terms, or hidden nodes, we cannot train.
                deferred.reject();
              }
            });
          });
        }, function () {
            //A promise failed. TODO This should probably be logged.
            deferred.reject();
        });
      });
    // Wait for the termIds and resultIds to be set.
    return deferred.promise;
  };
};

module.exports = NeuralNet;