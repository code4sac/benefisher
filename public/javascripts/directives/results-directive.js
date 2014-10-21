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

            $scope.$on('leafletDirectiveMarker.click', function(event, args) {
                var elem = angular.element;
                //Grab some information about where the results are currently on the page
                var resultOffset = elem('.results').scrollTop() +
                        elem('#result-' + args.markerName).position().top
                            - elem('.results').offset().top;


                //Animate to the result... if we've clicked a new marker!
                if ((elem('#result-' + args.markerName).position().top != elem('.results').offset().top)
                            && !$scope.waitingOnPromise) {

                    //waitingOnPromise describes whether we are waiting for an animation to finish.
                    $scope.waitingOnPromise = true;
                    elem('.results').animate({scrollTop: resultOffset}, "slow");

                    //Adjust the waitingOnPromise variable to unblock future animations
                    elem('.results').promise().done(function () {
                        $scope.waitingOnPromise = false;
                    });
                }
            });
        }
    }
};

directives.directive('scrollOnClick',  ScrollOnClick);