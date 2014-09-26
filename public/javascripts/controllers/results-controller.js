/**
 * Created by anthony on 9/26/14.
 */
var ResultsController = function ($scope, $http) {
    $http.get('/search').success(function (results) {
        $scope.jsonArray = results;
    }).error(function (error) {
        $scope.jsonArray = "Error";
    });
};