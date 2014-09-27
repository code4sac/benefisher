/**
 * Created by anthony on 9/26/14.
 */
var ResultsController = function ($scope, $http) {

    initResults();
    // TODO Adrian: Used to test adding results. Should be removed.
    displayResults();

    /**
     * Creates a results array inside of the scope object. Each result from user search will
     * be added to this array and be iterated over in the results.jade file.
     */
    function initResults() {
        angular.extend($scope, {
            results: []
        })
    }

    /**
     * Grabs the results from the user search and displays each one in its own results pane.
     */
    function displayResults() {
        $http.get('/search').success(showResults).error(showError);

        function showResults(data) {
            // Removes the previous results before showing the new ones.
            removeResults();
            data.forEach(function(service) {
                addResult(service);
            })
        }

        function showError(data, status, headers, config) {
            // TODO Adrian: What should be done if there is an error?
        }
    }

    /**
     * Adds a service object containing detailed information about it into the results array.
     * @param service - The service and its information to be added to the results window.
     */
    function addResult(service) {
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

        $scope.results.push(
            {'name' : name,
                'description' : desc,
                'address' : street + ', ' + city + ', ' + state + ' ' + zip,
                'hours' : hours
            }
        );
    }

    /**
     * Removes all results from the array by creating a new one.
     */
    function removeResults() {
        $scope.results = [];
    }
};