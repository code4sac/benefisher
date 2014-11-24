angular.module('benefisher.filters', []).filter('fuzzy', function() {
  return function(terms, enteredText) {
    var matching = [];
    var reg = new RegExp(enteredText.split('').join('\\w*').replace(/\W/, ""), 'i');
    terms.forEach(function(term) {
      if (term.name.match(reg)) {
        matching.push(term);
      }
    });
    if ( ! matching.length) {
      matching.push({ name: "Sorry, nothing found matching " + enteredText + ".", disabled: true });
    }
    return matching;
  };
});