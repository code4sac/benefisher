var noResult = { name: "Sorry, no results found!", oe_id: 99999, disabled: true }

angular.module('benefisher.filters', []).filter('fuzzy', function() {
  return function(terms, enteredText) {
    var filtered = [];
    // Credit to Dustin Diaz for this regex: http://www.dustindiaz.com/autocomplete-fuzzy-matching
    var reg = new RegExp(enteredText.split('').join('\\w*').replace(/\W/, ""), 'i');
    var i = terms.length;
    while (i) {
      var term = terms[--i];
      if (term.name.match(reg)) {
        filtered.push(term);
      }
    }
    if ( ! filtered.length) {
      filtered = [noResult];
    }
    return filtered;
  };
});