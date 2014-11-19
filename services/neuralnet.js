
var NeuralNet = function (HiddenNode, HiddenToResult, Term, TermToHidden, Result, q) {

  var trainingConstant = 0.5;
  /**
   *
   * @param userInfo Information regarding the user's search, including: need, situation, and location
   * @param results The results returned by the API for this given combination
   */
  this.rankResult  = function (userInfo, results) {

    var deferred = q.defer();

    userInfo = {category: ['help', 'house']};
    results = [201, 202, 203];

    var setProm = setupNetwork(userInfo, results);
    setProm.then(function(){
      var feedFor = feedForward();
      deferred.resolve(feedFor);
    });
    /*

    */
    return deferred.promise;

  };

  function setupNetwork (userInfo, results) {
    var deferred = q.defer();
    var termResultPromises = [];
    this.termIds = [];
    this.hiddenIds = [];
    this.resultIds = [];
    //TODO: Should be an array containing all term Ids or terms

    termResultPromises.push(getTermIds(userInfo));
    //TODO: Get relevant hidden ids for inputs
    //SELECT ALL RESULTS TO GET IDS.
    termResultPromises.push(getResultIds(results));

    q.all(termResultPromises).then(function(data){
      //this.termIds = data[0];
      //this.resultIds.push(data[1]);
      if (data[0] instanceof Array) {
        this.termIds = this.termIds.concat.apply(this.termIds, data[0]);
      } else {
        this.termIds.push(data[0]);
      }

      if (data[1] instanceof Array) {
        this.resultIds = this.resultIds.concat.apply(this.resultIds, data[1]);
      } else {
        this.resultIds.push(data[0]);
      }

      var hiddenIdPromise = getAllHiddenIds(this.termIds, this.resultIds);
      hiddenIdPromise.then(function (hiddenIds) {
        var termWeightPromises = [];
        var hiddenWeightPromises = [];
        //At this point, we have hidden IDs.
        this.hiddenIds.push(hiddenIds);
        //Create arrays for outputs.
        this.outgoingFromInput = [];
        this.outgoingFromHidden = [];
        this.outgoingFromResults = [];

        this.termIds.forEach( function (term) {
          this.outgoingFromInput.push(1.0);
        });

        this.hiddenIds.forEach(function (hiddenId) {
          this.outgoingFromHidden.push(1.0);
        });

        this.resultIds.forEach(function (hiddenId) {
          this.outgoingFromResults.push(1.0);
        });

        //Create weights matrix
        this.weightsInputToHidden = [];
        this.weightsHiddenToResults = [];

        this.termIds.forEach(function (term) {
          this.hiddenIds.forEach(function (hiddenId) {
            termWeightPromises.push(getStrength(term, hiddenId, 0));
          });
        });

        this.hiddenIds.forEach(function (hiddenId) {
          this.resultIds.forEach(function (resultId) {
            hiddenWeightPromises.push(getStrength(hiddenId, resultId, 1));
          });
        });

        q.all(termWeightPromises).then(function (weightsIToH) {
          weightsIToH.forEach(function(weight) {
            this.weightsInputToHidden.push([weight]);
          });
          q.all(hiddenWeightPromises).then(function (weightsHToR) {
            this.weightsHiddenToResults.push(weightsHToR);
            deferred.resolve(data);
          });
        });
      });

      /*

      */
    });

    return deferred.promise;

    /*TODO for testing. make this work irl.*/


  }

  function feedForward () {
    var i;
    var j;
    //Activate the nodes corresponding to the terms in the search
    for(i = 0; i < this.termIds.length; i++) {
      this.outgoingFromInput[i] = 1.0;
    }

    for(i = 0; i < this.hiddenIds.length; i++) {
      var sum = 0.0;
      for (j = 0; j < this.termIds.length; j++) {
        sum += this.outgoingFromInput[j] * this.weightsInputToHidden[j][i];
      }
      this.outgoingFromHidden[i] = tanh(sum);
    }

    for(i = 0; i < this.resultIds.length; i++) {
      var sum = 0.0;
      for(j = 0; j < this.hiddenIds.length; j++) {
        sum += (this.outgoingFromHidden[j] * this.weightsHiddenToResults[j][i]);
      }
      this.outgoingFromResults[i] = tanh(sum);
    }

    return this.outgoingFromResults;
  }

  /**
   * Returns all of the hidden ids associated with terms and results.
   */
  function getAllHiddenIds (termIds, resultIds) {
    var deferred = q.defer();
    var promises = [];
    var l1 = {};
    termIds.forEach( function (term) {
      //SELECT TOID FROM inputToHidden where FROMID = 'termName'
      promises.push(TermToHidden.findAll({where : {termId: term}}));
    });

    resultIds.forEach(function (resultId) {
      //SELECT FROM ID FROM hiddenToResult where TOID = resultId
      promises.push(HiddenToResult.findAll({where : {resultId: resultId}}));
    });

    q.all(promises).then(function (hiddenNodeLinks) {
      var toHiddenLinks = hiddenNodeLinks[0];
      var fromHiddenLinks = hiddenNodeLinks[1];
      toHiddenLinks.forEach(function(toLink) {
        l1[toLink.HiddenNodeId] = 1;
      });
      fromHiddenLinks.forEach(function(fromLink) {
        l1[fromLink.HiddenNodeId] = 1;
      });
      var keys = [];

      for (var key in l1) {
        if (l1.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      deferred.resolve(keys);
    });

    return deferred.promise;
  }

  function generateHiddenNode (termIds, resultIds) {
    var deferred = q.defer();
    var hiddenKey = termIds.join('_');
    //SELECT hiddenKey from hiddenNode where hiddenKey = hiddenKey
    HiddenNode.find({where: {create: hiddenKey}}).success(function (hiddenNode) {
      if (!hiddenNode) {
        //INSERT INTO hiddenNode values hiddenKey
        HiddenNode.create({create:hiddenKey}).success(function (node){
          termIds.forEach(function (term) {
            setStrength(term, node.id, 0, (1.0/termIds.length));
          });

          resultIds.forEach(function (result) {
            setStrength(node.id, result, 1, 0.1)
          });

          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  };

  function setStrength (fromId, toId, layer, strength) {
    var table = layer == 0 ? TermToHidden : HiddenToResult;
    var fromAttribute = layer == 0 ? 'TermId' : 'HiddenNodeId';
    var toAttribute = layer == 0 ? 'HiddenNodeId' : 'ResultId';
    //SELECT id from 'table' where fromid = 'fromId' and toid = 'toId'
    table.find({where: [fromAttribute + "= '" + fromId + "' AND " + toAttribute + "= '" + toId + "'"]}).success(function (connection) {
      if (connection) {
        //UPDATE connection in database
        connection.updateAttributes({strength: strength});
      } else {
        //connection doesn't currently exist.
        //INSERT INTO 'table' (fromId, toId, strength) values (fromId, toId, strength)
        var createObject = {strength: strength};
        createObject[fromAttribute] = fromId;
        createObject[toAttribute] = toId;
        table.create(createObject);
      }
    });

  }

  function getStrength (fromId, toId, layer) {
    var deferred = q.defer();
    var table = layer == 0 ? TermToHidden : HiddenToResult;
    var fromAttribute = layer == 0 ? 'TermId' : 'HiddenNodeId';
    var toAttribute = layer == 0 ? 'HiddenNodeId' : 'ResultId';
    var strength = false;
    //var strength = SELECT strength from 'table' where fromid = 'fromId' and toId = 'toId'
    table.find({where: [fromAttribute + "=" + fromId + " AND " + toAttribute + "=" + toId]}).success(function (link) {
      if (link) {
        deferred.resolve(link.strength);
      } else {
        deferred.resolve(layer == 0 ? 0.2 : layer == 1 ? 0 : null);
      }
    });

    return deferred.promise;
  }

  function tanh(x) {
    return (Math.exp(x) - Math.exp(-x))/(Math.exp(x) + Math.exp(-x));
  }

  function dtanh(y) {
    return 1.0 - (y * y);
  }

  function getTermIds(fullQuery) {
    var deferred = q.defer();
    var location = fullQuery.lat_lng;
    var needs = fullQuery.category;
    var situations = fullQuery.keyword;
    var promises = [];
    var termIds = [];
    if (location) {
      promises.push(Term.findOrCreate({where: {name: location}}));
    }
    if (needs) {
      needs.forEach(function (need) {
        promises.push(Term.findOrCreate({where: {name: need}}))
      });
    }
    if (situations) {
      situations.forEach(function (situation) {
        promises.push(Term.findOrCreate({where: {name: situation}}));
      });
    }

    q.all(promises).then(function (terms, boolean) {
      terms.forEach(function (term) {
        termIds.push(term[0].id);
      });
      deferred.resolve(termIds);
    });

    return deferred.promise;
  }

  function getResultIds (results) {
    var deffered = q.defer();
    var resultIds = [];
    var foundResults = [];
    var readPromises = [];
    results.forEach(function(result) {
      //TODO: This needs to be changed to match new data source
      readPromises.push(Result.find(result));
    });
    q.all(readPromises).then (function (results) {
      if (results) {
        var resultIds = [];
        results.forEach(function (result) {
          resultIds.push(result.id);
        });
        deffered.resolve(resultIds);
      }
    });

    return deffered.promise;
  }

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
  function backPropagate (targets) {
    var i;
    var j;
    var outputDeltas = [];
    var hiddenDeltas = [];
    var error;
    var change;
    for(i = 0; i < this.resultIds.length; i++) {
      error = targets[i] - this.outgoingFromResults[i];
      outputDeltas[i] = dtanh(this.outgoingFromResults[i]) * error;
    }

    for (i = 0; i < this.hiddenIds.length; i++) {
      error = 0.0;
      for (j = 0; j < this.resultIds.length; j++) {
        error += outputDeltas[j] * this.weightsHiddenToResults[i][j];
      }
      hiddenDeltas[i] = dtanh(this.outgoingFromHidden[i]) * error;
    }

    for(i = 0; i < this.hiddenIds.length; i++) {
      for (j = 0; j < this.resultIds.length; j++) {
        change = outputDeltas[j] * this.outgoingFromHidden[i];
        this.weightsHiddenToResults[i][j] = this.weightsHiddenToResults[i][j] + trainingConstant * change;
      }
    }

    for(i = 0; i < this.termIds.length; i++) {
      for (j = 0; j < this.hiddenIds.length; j++) {
        change = hiddenDeltas[j] * this.outgoingFromInput[i];
        this.weightsInputToHidden[i][j] += trainingConstant * change;
      }
    }
  };

  /**
   *
   * @param terms
   * @param results
   * @param selected
   * @param change This indicates what kind of change needs to be made.
   *                'Like' or interactions with buttons = 1
   *                'Expand' = 0.75
   *                'Hide' = -1
   */
  this.trainQuery = function (terms, results, selected, change) {
    terms = {category: ['help', 'house']};
    results = [201, 202, 203];
    selected = 201;
    change = 1;
    var targets = [];
    var i;
    setupNetwork(terms, results).then( function () {
      generateHiddenNode(this.termIds, this.resultIds).then(function () {

        feedForward();
        for(i = 0; i < results.length; i++) {
          targets[i] = 0;
        }
        targets[results.indexOf(selected)] = change;
        backPropagate(targets);
        updateDatabase();

      });
    });

  };
};

module.exports = NeuralNet;