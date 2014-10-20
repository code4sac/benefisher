/**
 * Created by anthony on 10/18/14.
 *
 * TODO: This needs to account for the following abnormal use cases:
 *          1. User has clicked a result with a very long animation and clicks a different result before the animation
 *              has ended. This case is hard to duplication manually.
 */

var directives = angular.module('benefisher.directives', []);

var ScrollOnClick = function () {
    return {
        restrict: 'A',
        link: function($scope, leafletData) {
            $scope.$on('leafletDirectiveMarker.click', function(event, args){

                //Grab some information about where the results are currently on the page
                var resultOffset = $('.results').scrollTop() + $('#result-' + args.markerName).position().top
                    - $('.results').offset().top;


                //Animate to the result... if we've clicked a new marker!
                if (($('#result-' + args.markerName).position().top != $('.results').offset().top)
                            && !$scope.waitingOnPromise) {

                    //waitingOnPromise describes whether we are waiting for an animation to finish.
                    $scope.waitingOnPromise = true;
                    $('.results').animate({scrollTop: resultOffset}, "slow");

                    //Adjust our current offset to account for the case where the div was not able to scroll down
                    // all the way. These calculations are done after the animation has been performed.
                    $('.results').promise().done(function () {
                        $scope.waitingOnPromise = false;
                    });
                }
            });
        }
    }
};

directives.directive('scrollOnClick', ScrollOnClick);