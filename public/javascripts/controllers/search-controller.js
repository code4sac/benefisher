/**
 * Created by jamesdoan on 10/9/14.
 */
var SearchController = function($scope, search, notification, $http, $timeout) {

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
  /*
   * Whenever OEPterms are changed, we must update the search.
   *
   * When there is only 1 OEP term to search, we search by category match, otherwise,
   * we search the entire service by all of the keywords.
   * */
  $scope.$watch('oepterms.selected', function () {
    var bEmergency = false;   // Indicates if a user put in a tag that contains "Emergency".
    keyword = [];
    keywordsDelimited = "";
    terms = $scope.oepterms;
    if (terms.length > 0) {
      if (terms.selected) {
        terms.selected.forEach(function (oepterm) {
          // If any of the tags contains "Emergency" anywhere in it, display emergency notification.
          if (oepterm.name.toLowerCase().indexOf("Emergency".toLowerCase()) > -1)
            bEmergency = true;
          keyword.push(oepterm.name);
        });
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

    if (bEmergency) {
      notification.new({
        message: 'My message.',
        status: {
          class: 'warning',
          duration: 30000
        }
      });
    }
  })
};
