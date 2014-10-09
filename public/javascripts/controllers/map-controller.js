/**
 * Created by jesserosato on 9/21/14.
 */

/**
 * Map Controller
 * @param $scope
 * @param search
 * @param notification
 * @param constants
 * @param leafletData
 * @constructor
 */
var MapController = function($scope, search, notification, constants, leafletData) {

  /** CONSTANTS **/
  // The ID of the Mapbox project to use for map tiles.
  var MAP_ID = constants.mapboxId;
  var MAP_TOKEN = constants.mapboxToken;
  // The map tiles URL.
  var TILE_URL = "https://{s}.tiles.mapbox.com/v3/" + MAP_ID + "/{z}/{x}/{y}.png?access_token=" + MAP_TOKEN;
  // The default, maximum and minimum zoom levels for the map
  var ZOOM_DEFAULT = 13;
  var ZOOM_MAX = 18;
  var ZOOM_MIN = 10;
  // The position for map controls: topright | topleft | bottomright | bottomleft
  var CONTROLS_POSITION = 'bottomright';

  /** PROPERITES **/
  // The current and previous bounds.
  var curBounds;
  var prevBounds;
  var self = this;
  // Expose public methods;
  self.update = _update;

  /** CONSTRUCTOR LOGIC **/
  initMap();
  // Listen for map movement
  $scope.$on('leafletDirectiveMap.moveend', function(event){
    leafletData.getMap().then(updateMap);
  });

  /** METHODS **/

  /**
   * Receive a promise that results are coming from the database.
   * @param data
   */
  function _update(data) {
    updateMarkers(data);
  }

  /**
   * Search for new results if map bounds have changed.
   * @param map
   */
  function updateMap(map) {
    updateBounds(map);
    if (boundsHaveChanged()) {
      search.search({ bounds: getBoundsString() });
    }
  }

  /**
   * Initialize the map.
   */
  function initMap() {
    // Subscribe to search pubsub
    search.subscribe(self.update);
    // Create defaults;
    var defaults = {
      tileLayer: TILE_URL,
      maxZoom: ZOOM_MAX,
      minZoom: ZOOM_MIN,
      zoomControlPosition: CONTROLS_POSITION,
      tileLayerOptions: {
        detectRetina: true,
        reuseTiles: true
      }
    };
    // Use Sacramento as default center
    var center = {
      lat: 38.5556,
      lng: -121.4689,
      zoom: ZOOM_DEFAULT
    };
    // Extend scope object with defaults and center for map.
    angular.extend($scope, { defaults: defaults, center: center, markers: [], results: [] });
  }

  /**
   * Update the current and previous bounds properties.
   * @param map
   */
  function updateBounds(map)
  {
    if (curBounds) {
      prevBounds = curBounds;
    }
    curBounds = map.getBounds();
  }

  /**
   * Returns true if the current bounds are not contained by the previous bounds.
   * @returns {boolean}
   */
  function boundsHaveChanged(map)
  {
    return ( ! prevBounds || ! prevBounds.contains(curBounds));
  }

  /**
   * Get the current map bounds as a comma-separated parameter string.
   * @returns {string}
   */
  function getBoundsString()
  {
    var nw = curBounds.getNorthWest();
    var se = curBounds.getSouthEast();
    return nw.lat + ',' + nw.lng + ',' + se.lat + ',' + se.lng;
  }

  /**
   * Identify locations returned through user search by adding markers on the map.
   */
  function updateMarkers(data) {
    // Remove all the previous markers before adding new ones.
    removeMarkers();
    data.forEach(function (service) {
      addMarker(service);
    });
  }

  /**
   * Adds a marker to the map with the attributes needed.
   * @param service - The service object to add to the map.
   */
  function addMarker(service) {
    var message = '<h4>' + service.name + '<h4>\n<h5>' + service.description + '</h5>\n<h5>' + service.hours + '</h5>';
    $scope.markers.push({
        lat: service.lat,
        lng: service.lng,
        message: message
    });
  }

  /**
   * Removes all markers from the array by creating a new one.
   */
  function removeMarkers() {
      $scope.markers = [];
  }

};