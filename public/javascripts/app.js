var benefisher = angular.module('benefisher', ['leaflet-directive', 'benefisher.services', 'benefisher.constants']);
// Add the Map Controller to the benefisher object.
benefisher.controller('MapController', ['$scope', 'search', 'notification', 'constants', 'leafletData', MapController]);
benefisher.controller('ResultsController', ['$scope', '$location', 'search', 'notification', 'interaction', ResultsController]);
benefisher.controller('OepController', ['$scope', '$http', OepController]);