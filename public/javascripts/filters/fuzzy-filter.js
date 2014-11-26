angular.module('benefisher.filters', []).filter('fuzzy', function() {
  return function(terms, enteredText) {
    var filtered = [];
    var reg = new RegExp(enteredText.split('').join('\\w*').replace(/\W/, ""), 'i');
    var i = terms.length;
    while (i) {
      if (terms[--i].name.match(reg)) {
        filtered.push(terms[i]);
      }
    }
    if ( ! filtered.length) {
      filtered.push({ name: "Sorry, nothing found matching " + enteredText + ".", disabled: true });
    }
    return filtered;
  };
});