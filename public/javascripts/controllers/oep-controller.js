/**
 * Created by jamesdoan on 10/9/14.
 */

var OepController = function ($scope, $http) {
  $http.get('oepterms/oep.json').success(function(data) {
    $scope.oepterms = data;
  });

  $scope.doFilter = function () {
    $scope.filterResult = $scope.search;
  }

}