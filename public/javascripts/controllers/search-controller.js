/**
 * Created by jamesdoan on 10/9/14.
 */
var SearchController = function($scope, search, notification, $http, $timeout) {


  var dangerTags = ["Emergency", "Disaster"];  // List of words to look for that signify immediate danger.
  var promise;  // Holds the promise for the notification so that it can be canceled if need be.

  $scope.oepterms = [];
  $scope.selectedOepTerms = [];

  $scope.situations = [];
  $scope.selectedSituations = [];

  $http.get('oepterms/oep.json').success(function(data) {
    $scope.oepterms = data;
  });

  $http.get('oepterms/situations.json').success(function(data) {
    $scope.situations = data;
  });

  $scope.removeOepterm=function(item){
    var index=$scope.selectedOepTerms.indexOf(item);
    $scope.selectedOepTerms.splice(index,1);
    _search();
  };

  $scope.addOepTerm=function(item){
    if ( ! item.disabled) {
      $scope.selectedOepTerms.push(item);
      _search();
    }
  };


  $scope.removeSituation=function(item){
    var index=$scope.selectedSituations.indexOf(item);
    $scope.selectedSituations.splice(index,1);
    _search();
  };

  $scope.addSituation=function(item){
    if ( ! item.disabled) {
      $scope.selectedSituations.push(item);
      _search();
    }
  };

  // Orders the terms in order by name (place a '-' in front of name to reverse the order).
  $scope.orderByAlpha = 'name';
  $scope.orderById = 'oe_id';
  // Orders the terms in order by length (place a '-' in front of name to reverse the order).
  $scope.orderByLength = '-name.length';

  /**
   * Determine whether a given term is a 'danger' term, and display a notification if so.
   * @param term
   */
  function checkEmergencyTerms(term)
  {
    var bEmergencyTag = false;  // Indicates that one of the tags contains "Emergency."
    // If any of the search term contains any words that signify immediate danger anywhere in it,
    //  set our emergency flag to true.
    dangerTags.forEach(function (dangerTag) {
      if ((term.toLowerCase().indexOf(dangerTag.toLowerCase()) > -1)) {
        bEmergencyTag = true;
      }
    });

    // Handle notification re: emergency terms
    _emergencyNotification(bEmergencyTag);
  }

  /**
   * Search based on need and situation.
   * @private
   */
  function _search()
  {
    var allCategoryNames = [];
    // Incorporate all terms into
    var oepterms = $scope.selectedOepTerms ? $scope.selectedOepTerms : [];
    var situations = $scope.selectedSituations ? $scope.selectedSituations : [];
    var allCategories = oepterms.concat(situations);
    allCategories.forEach(function(categoryObj) {
      allCategoryNames.push(categoryObj.name);
      checkEmergencyTerms(categoryObj.name);
    });
    search.search({ category: allCategoryNames.join(',') });
  }

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
    if (bEmergencyTag == true) {
      promise = notification.new(emergency, { singleton: true });
    }

    // Pulls the notification if "Emergency" is no longer contained in the search tags.
    if (bEmergencyTag == false)
      notification.remove(emergency, promise);
  }
};
