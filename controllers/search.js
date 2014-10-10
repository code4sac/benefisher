/**
 * Created by jesserosato on 9/29/14.
 */

/**
 * Controller for search.
 * @param req
 * @param res
 * @param Result The Result model.
 * @param request
 * @constructor
 */
var SearchController = function(req, res, Result, request)
{

  // Bounds query string should look like: 'top,left,bottom,right'.
  var bounds = constructQueryBounds(req.query);

  var apiUrl = 'https://ohana-api-demo.herokuapp.com/api/search';

  var requestOptions = {
    uri: apiUrl,
    qs: req.query
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

        var results = [];
        // Extract data into Result models
        data.forEach(function(element) {
          results.push(new Result(element));
        });

        res.json(results);
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

};

module.exports = SearchController;