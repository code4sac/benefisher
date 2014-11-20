/**
 * Created by jesserosato on 9/29/14.
 */
// Load environment variables
var dotenv = require('dotenv');
dotenv.load();

/**
 * Controller for search.
 * @param req
 * @param res
 * @param Result The Result model.
 * @param Query The Query model.
 * @param request
 * @param q
 * @constructor
 */
var SearchController = function(req, res, Result, Query, request, q) {

  var DELIMITER = ',';
  // Bounds query string should look like: 'top,left,bottom,right'.
  var bounds = constructQueryBounds(req.query);
  // Munge 'center' param to Ohana API's 'lat_lng'.
  req.query.lat_lng = req.query.center;
  // Get max results per query
  req.query.per_page = 100;
  req.query.radius = 50;
  //List of promises for q to wait for.
  var promises = [];
  var baseUrl = process.env.API_URL;
  var searchUrl = baseUrl + '/api/search';
  var locationsUrl = baseUrl + '/api/locations/';

  // TODO: move API token to .env and UPDATE TOKEN
  var requestOptions = {
    uri: searchUrl,
    headers: {
      // "X-Api-Token": 'fcfd0ff9d996520b5b1a70bde049a394'
    }
  };

  /**
   * Filter all the results based on query parameters, and render the results.
   */
  this.render = function () {
    //create an array containing all of the API requests we are going to make.
    var queries = createQueries(req.query);
    // Load JSON from API.
    queries.forEach(function (query) {
      //Request the specified query. getURL returns a promise, which will be handled by Q.
      var promise = getURL(query, requestOptions);
      promises.push(promise);
    });

    /*
     * Uses the q library to wait for all of the promises array (containing all the promises from the GET requests
     * Once all of the promises have been fulfilled (meaning that all of the GET requests have been completed), we
     * can flatten the data received and send it to a function to make sure it is saved to the database appropriately.
    */
    q.all(promises).then(function (allResults) {
      var combinedResults = [];
      combinedResults = combinedResults.concat.apply(combinedResults, allResults);
      handleHttpResponse(combinedResults);
    });

    /**
     * Handle the HTTP response
     * @param data
     */
    function handleHttpResponse(data) {
      // Only search by bounds if the bounds parameter exists
      if (bounds) {
        data = data.filter(isInQueryBounds);
      }
      // Initialize individual Results
      var unsavedResults = [];
      data.forEach(function (location) {
        unsavedResults.push(Result.build().setLocation(location));
      });

      // We want to search the DB for results that already exist, and save the ones that don't.
      // This is important to pass DB ID's to client for use in saving Interactions, as well as
      // for saving Queries.
      // Search DB for existing results.
      Result.multiFind(unsavedResults).success(function(foundResults) {
        // Filter out the existing results (foundResults gets passed to filterExistingResults as 'this')
        var newResults = unsavedResults.filter(filterExistingResult, foundResults);
        if (newResults.length) {
          // Go get detailed data about results not in DB from API
          var locationsPromises = [];
          var locationsOptions = {};
          newResults.forEach(function(location) {
            locationsOptions.uri = locationsUrl + location.externalId;
            locationsPromises.push(getURL(null, locationsOptions));
          });
          q.all(locationsPromises).then(function(newLocationsData) {
            var newLocations = [];
            newLocations = newLocations.concat.apply(newLocations, newLocationsData);
            var newResults = [];
            newLocations.forEach(function (location) {
              newResults.push(Result.build().setLocation(location));
            });
            // Save DB results
            Result.multiInsert(newResults).success(function(results) {
              var allResults = foundResults.concat(results);
              saveQuery(allResults);
              res.json(allResults);
            }).error(function(error) {
              serverError('Uh-oh, there was a problem with the database!', 500);
            });
          });
        } else {
          saveQuery(foundResults);
          res.json(foundResults);
        }
      }, function(error) {
        serverError('Uh-oh, there was a problem with the database!', 500);
      });
    }
  };
    /**
     * Render a server error.
     * @param message
     * @param status
     */
    function serverError(message, status) {
      res.status(status).json({error: message});
    }

    /**
     * Build a coordinates object from query parameters.
     * @param query
     * @returns {boolean|Object}
     */
    function constructQueryBounds(query) {
      if (query && query.bounds) {
        var boundsArray = query.bounds.split(DELIMITER);
        if (boundsArray.length == 4) {
          bounds = {
            top: parseFloat(boundsArray[0]),
            left: parseFloat(boundsArray[1]),
            bottom: parseFloat(boundsArray[2]),
            right: parseFloat(boundsArray[3])
          };
        }
      }
      return bounds;
    }

    /**
     * Determine whether a location is within the query bounds.
     * @param location
     * @returns {boolean}
     */
    function isInQueryBounds(location) {

      var coords = location.coordinates;
      if ( ! coords || ! coords[0] || ! coords[1]) {
        return false;
      }
      var longitude = coords[0];
      var latitude = coords[1];

      return latitude <= bounds.top
        && longitude >= bounds.left
        && latitude >= bounds.bottom
        && longitude <= bounds.right;
    }

    /**
     * Filter results that already exist. 'this' should be the array of found results.
     * @param unsavedResult
     * @returns {boolean}
     */
    function filterExistingResult(unsavedResult) {
      var keep = true;
      this.forEach(function (foundResult) {
        if (unsavedResult.equals(foundResult)) {
          keep = false;
        }
      });
      return keep;
    }

    /**
     * Save the search query to the DB
     * @param results
     */
    function saveQuery(results) {
      Query.create({
        bounds: req.query.bounds,
        terms: req.query.terms
      }).then(function(query) {
        query.setResults(results);
      });
    }

    /**
     * Used to create multiple query strings for our search to use.
     * This function is used for a multiple category search.
     * @param query
     */
    function createQueries(query) {
      var queries = [];
      if (query.category) {
        //create a new string for each category
        var categories = query.category.split(',');
        categories.forEach(function (cat) {
          var newQuery = cloneQuery(query);
          newQuery.category = cat;
          queries.push(newQuery);
        });
      } else {
        //create 1 string
        queries.push(query);
      }
      return queries;
    }

   /**
   *  A promise-based solution to making HTTP GET requests. Uses Q's defer() method to create
   *  a promise, and then uses that defer element to either fulfill or reject the promise.
   * this function also handles any bad server response codes.
   * @param qs
   * @param options
   * @returns {*}
   */
    function getURL(qs, options) {
      var deferred = q.defer();
      options.qs = qs;
      request(options, function (error, response, body) {
        // Throw a 500 if our response returned an error, or if the response code is not between 200 and 399.
        if (error || response.statusCode < 200 || response.statusCode >= 400) {
          serverError("Error loading data.", 500);
          deferred.reject();
        } else {
          var data = JSON.parse(body);
          deferred.resolve(data);
        }
      });
      return deferred.promise;
    }

    /**
     *  Function used to create a clone of the query sent in. This is used to create clones of a query that is
     *  being passed-by-reference.
     * @param query
     * @returns {{}}
     */
    function cloneQuery(query) {
      var clone ={};
      for( var key in query ){
        if(query.hasOwnProperty(key)) //ensure not adding inherited props
          clone[key]=query[key];
      }
      return clone;
    }
};



module.exports = SearchController;
