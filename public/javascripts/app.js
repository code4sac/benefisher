var benefisher = angular.module('benefisher', ['leaflet-directive', 'benefisher.services']);
// Add the Map Controller to the benefisher object.
benefisher.controller('MapController', ['$scope', 'search', 'leafletData', MapController]);
benefisher.controller('ResultsController', ['$scope', 'search', ResultsController]);