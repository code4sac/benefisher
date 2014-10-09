/**
 * Created by jesserosato on 9/29/14.
 */

/**
 * Controller for search.
 * @param req
 * @param res
 * @param Result The Result model.
 * @param fileSystem
 * @constructor
 */
var SearchController = function(req, res, Result, fileSystem)
{

  var terms = constructQueryTermsArray(req.query);
  // Bounds query string should look like: 'top,left,bottom,right'.
  var bounds = constructQueryBounds(req.query);

  /**
   * Filter all the results based on query parameters, and render the results.
   */
  this.render = function()
  {
    var output = [];

    // Load JSON from file.
    return fileSystem.readFile('sample_data/sample.json', null, function(err, data) {
      if (err) {
        // Error
        res.status(500).send("Error loading data.");
      } else {
        data = JSON.parse(data);
        if (bounds) {
          data = filterByQueryBounds(data);
        }
        if (terms.length) {
          data = data.filter(containsQueryTerms);
        }
        var dataCount = data.length;
        var results = [];
        for(var i = 0; i < dataCount; i++) {
          results.push(new Result(data[i]));
        }
        output = output.concat.apply(output, results);
        res.json(output);
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
   * Filter the data array based on query bounds.
   * @param data
   * @returns {*}
   */
  function filterByQueryBounds(data)
  {
    var i = data.length;
    while (i--) {
      data[i].locations = data[i].locations.filter(isInQueryBounds);
      // If there's no locations, remove the result.
      if ( ! data[i].locations.length) {
        data.splice(i, 1);
      }
    }
    return data;
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