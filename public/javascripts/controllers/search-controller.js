/**
 * Created by jamesdoan on 10/9/14.
 */
var SearchController = function($scope, search, notification, $http, $timeout) {


  var dangerTags = ["Emergency", "Disaster"];  // List of words to look for that signify immediate danger.
  var categories = [];
  var promise;  // Holds the promise for the notification so that it can be canceled if need be.

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

  $scope.removeOepterm=function(item){
    var index=$scope.oepterms.selected.indexOf(item);
    $scope.oepterms.selected.splice(index,1);
  };

  $scope.addOepterm=function(item){
    $scope.oepterms.selected.push(item);
  };


  $scope.removeSituation=function(item){
    var index=$scope.situations.selected.indexOf(item);
    $scope.situations.selected.splice(index,1);
  };

  $scope.addSituation=function(item){
    $scope.situations.selected.push(item);
  };

  // Orders the terms in order by name (place a '-' in front of name to reverse the order).
  $scope.orderByAlpha = 'name';
  $scope.orderById = 'oe_id';
  // Orders the terms in order by length (place a '-' in front of name to reverse the order).
  $scope.orderByLength = '-name.length';

  /*
   * Whenever OEPterms or Situations are changed, we must update the search.
   *
   * When there is only 1 OEP term to search, we search by category match, otherwise,
   * we search the entire service by all of the keywords.
   * */
  $scope.$watch('oepterms.selected', _search);
  $scope.$watch('situations.selected', _search);


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
    var oepterms = $scope.oepterms.selected ? $scope.oepterms.selected : [];
    var situations = $scope.situations.selected ? $scope.situations.selected : [];
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
