/**
 * Created by jamesdoan on 10/9/14.
 */
var SearchController = function($scope, search, notification, $http, $timeout) {

  var bEmergency = false; // Used to decide if the emergency notification needs to be displayed.
  var promise;

  $http.get('oepterms/oep.json').success(function(data) {
    $scope.oepterms = data;
  });

  $http.get('oepterms/situations.json').success(function(data) {
    $scope.situations = data;
  });

  $scope.disabled = undefined;
  $scope.searchEnabled = undefined;

  $scope.enable = function() {
    $scope.disabled = false;
  };

  $scope.disable = function() {
    $scope.disabled = true;
  };

  $scope.enableSearch = function() {
    $scope.searchEnabled = true;
  }

  $scope.disableSearch = function() {
    $scope.searchEnabled = false;
  }

  $scope.someGroupFn = function (item){

    if (item.name[0] >= 'A' && item.name[0] <= 'M')
      return 'From A - M';

    if (item.name[0] >= 'N' && item.name[0] <= 'Z')
      return 'From N - Z';

  };

  $scope.counter = 0;
  $scope.someFunction = function (item, model){
    $scope.counter++;
    $scope.eventResult = {item: item, model: model};
  };
  $scope.oepterms = [];
  $scope.oepterms.selected = [];

  $scope.situations = [];
  $scope.situations.selected = [];

  // Orders the terms in order by name (place a '-' in front of name to reverse the order).
  $scope.orderByAlpha = 'name';
  // Orders the terms in order by length (place a '-' in front of name to reverse the order).
  $scope.orderByLength = '-name.length';

  /*
   * Whenever OEPterms are changed, we must update the search.
   *
   * When there is only 1 OEP term to search, we search by category match, otherwise,
   * we search the entire service by all of the keywords.
   * */
  $scope.$watch('oepterms.selected', function () {
    var bEmergencyTag = false;  // Indicates that one of the tags contains "Emergency."
    keyword = [];
    keywordsDelimited = "";
    terms = $scope.oepterms;
    if (terms.length > 0) {
      if (terms.selected) {
        terms.selected.forEach(function (oepterm) {
          // If any of the tags contains "Emergency" anywhere in it, set our flag to true.
          if ((oepterm.name.toLowerCase().indexOf("Emergency".toLowerCase()) > -1)) {
            bEmergencyTag = true;
          }
          keyword.push(oepterm.name);
        });

        // Will show emergency notification if it isn't already displayed. Will also update global flag.
        _emergencyNotification(bEmergencyTag);
        bEmergency = bEmergencyTag;

        if (terms.selected.length == 1) {
          search.search({category: keyword[0], keyword: ""});
        } else {
          keywordsDelimited = keyword.join(',');
          search.search({keyword: keywordsDelimited, category: ""});
        }
      } else {
        search.search({keyword: "", category: ""});
      }
    }
  });

  /**
   * Will display a notification to let user know to call 911 if any search tag contains "Emergency."
   * @param bEmergencyTag
   * @private
   */
  function _emergencyNotification(bEmergencyTag) {
    var emergency = {
      message: 'If you need immediate assistance or are in danger, call 911. Benefisher is not '
      + 'an emergency site.',
      status: {
        class: 'warning',
        duration: 25000
      }
    };

    // If a tag contains "Emergency," and it's the first tag in the search to contain it, then we will
    //  display the notification.
    if (bEmergencyTag == true && bEmergency == false) {
      promise = notification.new(emergency);
    }

    // Pulls the notification if "Emergency" is no longer contained in the search tags.
    if (bEmergencyTag == false)
      notification.remove(emergency, promise);
  }
};
