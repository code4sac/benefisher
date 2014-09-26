/**
 * Created by jesserosato on 9/21/14.
 */
var MapController = function ($scope) {

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

  // CONTROLLER LOGIC
  initMap();

  /**
   * Initialize the map.
   */
  function initMap() {
    // Extend scope object with defaults and center for map.
    angular.extend($scope, {
      defaults: {
        tileLayer: TILE_URL,
        maxZoom: ZOOM_MAX,
        minZoom: ZOOM_MIN,
        zoomControlPosition: CONTROLS_POSITION,
        tileLayerOptions: {
          detectRetina: true,
          reuseTiles: true
        }
      },
      // Use Sacramento as default center
      center: {
        lat: 38.5556,
        lng: -121.4689,
        zoom: ZOOM_DEFAULT
      },

      markers: {
          m1: {
              lat: 38.569496,
              lng:-121.471978,
              message: "Anthony's house. Static marker."
          },
          m2: {
              lat:38.559959,
              lng:-121.420625,
              message:"California State University, Sacramento"
          },
          m3: {
              lat:38.599085,
              lng:-121.434066,
              message: "ADR's house."
          },
          m4: {
              lat:38.591044,
              lng:-121.482254,
              message: "Loaves & Fishes"
          }
      }
    });
  }
};