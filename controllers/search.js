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
        if ( terms.length ) {
          result = result.filter(filterByQueryTerms);
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
   * Recursive function to filter an item by search terms.
   * @param item
   */
  function filterByQueryTerms(item)
  {
    // Recursive case: item is array.
    if (Object.prototype.toString.call(item) === '[object Array]') {
      // If there are any objects left in the filtered array, query terms were found.
      return item.filter(filterByQueryTerms).length;

    }
    // Recursive case: item is object.
    if (typeof item === 'object') {
      for (property in item) {
        if (filterByQueryTerms(item[property])) {
          return true;
        }
      }
    }
    // Terminating case: item is string.
    if (typeof item === 'string') {
      for (i = 0; i < terms.length; i++) {
        if (item.match(terms[i])) {
          return true;
        }
      }
    }
  }
}

module.exports = SearchController;