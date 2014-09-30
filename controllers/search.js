/**
 * Created by jesserosato on 9/29/14.
 */

/**
 * Controller for search.
 * @param req
 * @param res
 * @param fileSystem
 */
var SearchController = function(req, res, fileSystem)
{

  var terms = constructQueryTermsArray(req.query);
  // Bounds query string should look like: 'top,left,bottom,right'.
  var bounds = constructQueryBounds(req.query);

  /**
   * Filter all the results based on query parameters, and render the results.
   */
  this.render = function()
  {
    // Load JSON from file.
    return fileSystem.readFile('sample_data/sample.json', null, function(err, data) {
      if (err) {
        // Error
        res.status(500).send("Error loading data.");
      } else {
        var result = JSON.parse(data);
        if (bounds) {
          var i = result.length;
          while (i--) {
            result[i].locations = result[i].locations.filter(isInQueryBounds);
            // If there's no locations, remove the result.
            if ( ! result[i].locations.length) {
              result.splice(i, 1);
            }
          }
        }
        if ( terms.length ) {
          result = result.filter(containsQueryTerms);
        }
        res.json(result);
      }
    });
  };

  /**
   * Construct an array of query terms from the 'terms' query parameter.
   * @returns {Array}
   */
  function constructQueryTermsArray(query)
  {
    var terms = [];
    if ( query && query.terms && query.terms.length > 2) {
      terms = query.terms.split(',');
      terms.forEach(function (term, index, terms) {
        terms[index] = new RegExp(term.trim(), 'gi');
      });
    }
    return terms;
  }

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
    if ( ! location.latitude || ! location.longitude) {
      return false;
    }
    console.log(bounds);
    console.log(location.latitude);
    console.log(location.longitude);
    return location.latitude <= bounds.top
      && location.longitude >= bounds.left
      && location.latitude >= bounds.bottom
      && location.longitude <= bounds.right;
  }

  /**
   * Recursive function to filter an item by search terms.
   * @param item
   */
  function containsQueryTerms(item)
  {
    // Recursive case: item is array.
    if (Object.prototype.toString.call(item) === '[object Array]') {
      // If there are any objects left in the filtered array, query terms were found.
      return item.filter(containsQueryTerms).length;

    }
    // Recursive case: item is object.
    if (typeof item === 'object') {
      for (property in item) {
        if (containsQueryTerms(item[property])) {
          return true;
        }
      }
    }
    // Terminating case: item is string.
    if (typeof item === 'string') {
      for (var i = 0; i < terms.length; i++) {
        if (item.match(terms[i])) {
          return true;
        }
      }
    }
  }
}

module.exports = SearchController;