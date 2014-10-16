/**
 * Created by jesserosato on 9/29/14.
 */

/**
 * Controller for search.
 * @param req
 * @param res
 * @param Result The Result model.
 * @param Query The Query model.
 * @param request
 * @constructor
 */
var SearchController = function(req, res, Result, Query, request)
{

  // Bounds query string should look like: 'top,left,bottom,right'.
  var bounds = constructQueryBounds(req.query);

  var apiUrl = 'http://ohanapi.herokuapp.com/api/search';

  // TODO: move API token to .env
  var requestOptions = {
    uri: apiUrl,
    qs: req.query,
    headers: {
      "X-Api-Token": 'fcfd0ff9d996520b5b1a70bde049a394'
    }
  };

  /**
   * Filter all the results based on query parameters, and render the results.
   */
  this.render = function()
  {
    var output = [];

    // Load JSON from API.
    request(requestOptions, handleHttpResponse);

    /**
     * Handle the HTTP response
     * @param error
     * @param response
     * @param body
     */
    function handleHttpResponse(error, response, body)
    {
      // Throw a 500 if our response returned an error, or if the response code is not between 200 and 399.
      if (error || response.statusCode < 200 || response.statusCode >= 400) {
        res.status(500).send("Error loading data.");
      } else {
        data = JSON.parse(body);
        // Only search by bounds if the bounds parameter exists
        if (bounds) {
          data = data.filter(isInQueryBounds);
        }

        // Initialize individual Results
        var unsavedResults = [];
        data.forEach(function(location) {
          unsavedResults.push(Result.build().setLocation(location));
        });

        // We want to search the DB for results that already exist, and save the ones that don't.
        // This is important to pass DB ID's to client for use in saving Interactions, as well as
        // for saving Queries.
        // Search DB for existing results.
        Result.multiFind(unsavedResults).success(function(foundResults) {
          // Filter out the existing results
          var newResults = unsavedResults.filter(filterExistingResult, foundResults);
          if (newResults.length) {
            // Save DB results
            Result.multiInsert(newResults).success(function(results) {
              var allResults = foundResults.concat(results);
              saveQuery(allResults)
              res.json(allResults);
            }).error(function(error) {
              // TODO: Handle error (log it, at least).
              res.json(unsavedResults);
            });
          } else {
            saveQuery(foundResults);
            res.json(foundResults);
          }
        }).error(function(error) {
          // TODO: Handler error (log it, at least).
          res.json(unsavedResults);
        });
      }
    }
  };

  /**
   * Build a coordinates object from query parameters.
   * @param query
   * @returns {boolean|Object}
   */
  function constructQueryBounds(query)
  {
    if (query && query.bounds) {
      var boundsArray = query.bounds.split(',');
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
  function isInQueryBounds(location)
  {
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
  function filterExistingResult(unsavedResult)
  {
    this.forEach(function(foundResult) {
      if (unsavedResult.equals(foundResult)) {
        return false;
      }
    });
    return true;
  }

  /**
   * Save the search query to the DB
   * @param results
   */
  function saveQuery(results)
  {
    var query = Query.build({
      bounds: req.query.bounds,
      terms: req.query.terms,
      userPostalCode: req.query.userPostalCode
    });
    query.setResults(results);
    // TODO: handle errors
    query.save();
  }

};

module.exports = SearchController;