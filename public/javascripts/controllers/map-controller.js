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
var MapController = function ($scope, search, notification, constants, leafletData) {

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

  // Updates the map after the map loads.
  $scope.$on('leafletDirectiveMap.load', function (event) {
    leafletData.getMap().then(updateMap);
  });

  // Updates the map after user stops scrolling.
  $scope.$on('leafletDirectiveMap.dragend', function (event) {
    leafletData.getMap().then(updateMap);
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
      lat: 37.5520,
      lng: -122.3131,
      zoom: ZOOM_DEFAULT
    };

    // Extend scope object with defaults and center for map.
    angular.extend($scope, { defaults: defaults, center: center, markers: [], results: [] });
  }

  /**
   * Update the current and previous bounds properties.
   * @param map
   */
  function updateBounds(map) {
    if (curBounds) {
      prevBounds = curBounds;
    }
    curBounds = map.getBounds();
  }

  /**
   * Returns true if the current bounds are not contained by the previous bounds.
   * @returns {boolean}
   */
  function boundsHaveChanged(map) {
    return ( !prevBounds || !prevBounds.contains(curBounds));
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
        var icon = createIcon(tmpMarkers.length+1);
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
      message: service.popup,
      focus: service.selected,
      hashKey: service.hashKey
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