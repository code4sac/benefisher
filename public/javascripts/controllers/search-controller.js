/**
 * Created by jamesdoan on 10/9/14.
 */
var SearchController = function($scope, search, $http, $timeout) {

  $http.get('oepterms/oep.json').success(function(data) {
    $scope.oepterms = data;
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

  /*
   * Whenever OEPterms are changed, we must update the search.
   *
   * When there is only 1 OEP term to search, we search by category match, otherwise,
   * we search the entire service by all of the keywords.
   * */
  $scope.$watch('oepterms.selected', function () {
    keyword = [];
    keywordsDelimited = "";
    terms = $scope.oepterms;
    if (terms.length > 0) {
      if (terms.selected) {
        terms.selected.forEach(function (oepterm) {
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

  })
};
