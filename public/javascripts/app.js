var benefisher = angular.module('benefisher', ['leaflet-directive', 'benefisher.services', 'benefisher.constants', 'benefisher.directives', 'ngSanitize', 'ui.select', 'ui.bootstrap']);
// Add the Map Controller to the benefisher object.
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */

benefisher.config(function(uiSelectConfig) {
  uiSelectConfig.theme = 'select2';
});

benefisher.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

benefisher.controller('MapController', ['$scope', 'search', 'notification', 'constants', 'leafletData', MapController]);
benefisher.controller('ResultsController', ['$scope', '$location', 'search', 'notification', 'interaction', ResultsController]);
benefisher.controller('OepController', ['$scope', '$http', '$timeout', OepController]);
