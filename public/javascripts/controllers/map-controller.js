/**
 * Created by jesserosato on 9/21/14.
 */

/**
 * Map Controller
 * @param $scope
 * @param $http
 * @param search
 * @param leafletData
 * @constructor
 */
var MapController = function($scope, search, leafletData) {

  /** CONSTANTS **/
  // The ID of the Mapbox project to use for map tiles.
  var MAP_ID = 'jesserosato.jihh0bm7';
  // The map tiles URL.
  var TILE_URL = "https://{s}.tiles.mapbox.com/v3/" + MAP_ID + "/{z}/{x}/{y}.png";
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

  /** CONSTRUCTOR LOGIC **/
  initMap();
  // Listen for map movement
  $scope.$on('leafletDirectiveMap.moveend', function(event){
    leafletData.getMap().then(function(map) {
      if (boundsHaveChanged(map)) {
        search.search({ bounds: getBounds() });
      }
    });
  });

  /** METHODS **/

  /**
   * Receive a promise that results are coming from the database.
   * @param data
   */
  this.update = function(data) {
    updateMarkers(data);
  };

  /**
   * Initialize the map.
   */
  function initMap() {
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
   * Returns true if the new bounds are not contained by the existing bounds.
   * @param map
   * @returns {boolean}
   */
  function boundsHaveChanged(map)
  {
    if (curBounds) {
      prevBounds = curBounds;
    }
    curBounds = map.getBounds();
    return ( ! prevBounds || ! prevBounds.contains(curBounds));
  }

  /**
   * Proxy for search service's search()
   */
  function getBounds()
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
    var name = service.name;
    var lat = service.locations[0].latitude;
    var lng = service.locations[0].longitude;
    var desc = service.locations[0].description;
    var city = service.locations[0].address_attributes.city;
    var state = service.locations[0].address_attributes.state;
    var street = service.locations[0].address_attributes.street;
    var zip = service.locations[0].address_attributes.zip;
    var hours = service.locations[0].hours;
    var urls = service.locations[0].urls;

    var message = '<h4>' + name + '<h4>\n<h5>' + desc + '</h5>\n<h5>' + hours + '</h5>';

    $scope.markers.push({
        lat: lat,
        lng: lng,
        message: message
    });
  };

  /**
   * Removes all markers from the array by creating a new one.
   */
  function removeMarkers() {
      $scope.markers = [];
  }
};