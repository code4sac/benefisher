var benefisher = angular.module('benefisher', ['leaflet-directive', 'benefisher.services']);
// Add the Map Controller to the benefisher object.
benefisher.controller('MapController', ['$scope', 'search', 'notification', 'leafletData', MapController]);
benefisher.controller('ResultsController', ['$scope', 'search', 'notification', ResultsController]);