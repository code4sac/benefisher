/**
 * Created by anthony on 10/18/14.
 *
 * TODO: This needs to account for the following abnormal use cases:
 *          1. User has scrolled the results list, then clicks a result
 *          2. User has clicked the result multiple times very quickly.
 */

var directives = angular.module('benefisher.directives', []);

var ScrollOnClick = function () {
    return {
        restrict: 'A',
        link: function($scope, leafletData) {
            $scope.$on('leafletDirectiveMarker.click', function(event, args){

                //Grab some information about where the results are currently on the page
                var resultOffset = $scope.currentOffset + $('#result-' + args.markerName).position().top
                    - $('.results').offset().top;

                $scope.currentOffset = resultOffset;

                //Animate to the result... if we've clicked a new marker!
                if ($('#result-' + args.markerName).position().top != $('.results').offset().top) {
                    $('.results').animate({scrollTop: resultOffset}, "slow");

                    //Adjust our current offset to account for the case where the div was not able to scroll down
                    // all the way. These calculations are done after the animation has been performed.
                    $('.results').promise().done(function () {
                        var difference = $('#result-' + args.markerName).position().top - $('.results').offset().top;
                        $scope.currentOffset -= difference;
                    });
                }
            });
        }
    }
};

directives.directive('scrollOnClick', ScrollOnClick);