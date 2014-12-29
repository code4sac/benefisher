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
var MapController = function ($scope, search, notification, constants, leafletData, tour) {

  /** CONSTANTS **/
  // The ID of the Mapbox project to use for map tiles.
  var MAP_ID = constants.mapboxId;
  var MAP_TOKEN = constants.mapboxToken;
  // The map tiles URL.
  var TILE_URL = "https://{s}.tiles.mapbox.com/v3/" + MAP_ID + "/{z}/{x}/{y}.png?access_token=" + MAP_TOKEN;
  // The default, maximum and minimum zoom levels for the map
  var ZOOM_DEFAULT = 13;
  var ZOOM_MAX = 18;
  var ZOOM_MIN = 13;
  // Default lat/lng
  // Sacramento
  var LAT_DEFAULT = 38.5643;
  var LNG_DEFAULT = -121.4711;
  // The position for map controls: topright | topleft | bottomright | bottomleft
  var CONTROLS_POSITION = 'topleft';

  /** PROPERITES **/
  // The current bounds and center.
  var curBounds;
  var curCenter;
  var self = this;

  // Expose public methods;
  self.update = _update;

  /** CONSTRUCTOR LOGIC **/
  initMap();

  // Updates the map after the map loads.
  $scope.$on('leafletDirectiveMap.load', function (event) {
    leafletData.getMap().then(updateMap);
  });

  // Search to restart search timer.
  $scope.$on('leafletDirectiveMap.dragstart', function (event) {
    search.cancelSearch();
  });

  // Updates the map after user stops scrolling.
  $scope.$on('leafletDirectiveMap.dragend', function (event) {
    leafletData.getMap().then(function(map) {
      updateCoords(map);
      search.search({
        bounds: getBoundsString(),
        center: getCenterString()
      }, 500);
    });
  });

  // Updates the map after user stop zooming.
  $scope.$on('leafletDirectiveMap.zoomend', function (event) {
    leafletData.getMap().then(updateMap);
  });

  // Listen for click event on markers
  $scope.$on('leafletDirectiveMarker.click', function (event, args) {
    search.selected($scope.markers[args.markerName]);
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
    updateCoords(map);
    search.search({
      bounds: getBoundsString(),
      center: getCenterString()
    });
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
      lat: LAT_DEFAULT,
      lng: LNG_DEFAULT,
      zoom: ZOOM_DEFAULT
    };

    // Extend scope object with defaults and center for map.
    angular.extend($scope, { defaults: defaults, center: center, markers: [], results: [] });

    // Starts the tour for first time visitors.
    tour.startTour();
  }

  /**
   * Update the current bounds and center properties.
   * @param map
   */
  function updateCoords(map) {
    curBounds = map.getBounds();
    curCenter = map.getCenter();
    $scope.curBounds = curBounds;
    $scope.curCenter = curCenter;

  }

  /**
   * Get the current map bounds as a comma-separated parameter string.
   * @returns {string}
   */
  function getBoundsString() {
    var nw = curBounds.getNorthWest();
    var se = curBounds.getSouthEast();
    return nw.lat + ',' + nw.lng + ',' + se.lat + ',' + se.lng;
  }

  /**
   * Get the current map center as a string: lat,lng
   * @returns {string}
   */
  function getCenterString() {
    return curCenter.lat + ',' + curCenter.lng;
  }

  /**
   * Identify locations returned through user search by adding markers on the map.
   * @param data
   */
  function updateMarkers(data) {
    // Deselects all the markers so that the map isn't pulled back to previously selected
    //  marker.
    for (var i = 0; i < $scope.markers.length; i++){
      $scope.markers[i].focus = false;
    }

    // Adds the data to the list of markers.
    var tmpMarkers = [];
    data.forEach(function (service, index) {
      // The marker will only be added to the list of markers if it has not been ignored.
      //  An icon with the marker's number will be created and then applied to the marker.
      if (!service.ignored) {
        var icon;
        if (service.selected)
          icon = createIcon(tmpMarkers.length+1, "#FF4A32");
        else
          icon = createIcon(tmpMarkers.length+1)
        tmpMarkers.push(createMarker(service, icon));
      }
    });
    $scope.markers = tmpMarkers;
  }

  /**
   * Create a marker object
   * @param service - The service object to add to the map.
   */
  function createMarker(service, icon) {
    return {
      icon: icon,
      lat: service.lat,
      lng: service.lng,
      focus: service.selected,
      id: service.id
    };
  }

  /**
   * Creates an icon for a marker object.
   * @param icon - The icon that will be displayed on the marker.
   * @param color - The color to apply to the marker.
   */
  function createIcon(icon, color, size) {
    // If color is null, will make the color the secondary color (located in color.scss).
    var color = color ? color : "#2F82BD";
    // If size is null, will make the marker the large size.
    var size = size ? size : "l";
    return {
      type: 'makiMarker',
      icon: icon,
      color: color,
      size: size
    }
  }

};