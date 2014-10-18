/**
 * Created by anthony on 10/18/14.
 */

//Be sure:
// to declare a $scope.currentOffset variable
// add the scroll-on-click directive to the .results wrapper
benefisher.directive('scrollOnClick', function() {
    return {
        restrict: 'A',
        link: function($scope, leafletData) {
            $scope.$on('leafletDirectiveMarker.click', function(event, args){
                //Currently trying to figure out the correct way to handle this for the case where
                //we are in an offset past the clicked result
                var resultOffset = $scope.currentOffset + $('#result-' + args.markerName).position().top
                    - $('.results').offset().top;

                $scope.currentOffset = resultOffset;

                //Animate to the result.
                $('.results').animate({scrollTop: resultOffset}, "slow");

                //Adjust our current offset to account for the case where the div was not able to scroll down
                // all the way. These calculations are done after the animation has been performed.
                $('.results').promise().done(function () {
                    var difference = $('#result-' + args.markerName).position().top  - $('.results').offset().top;
                    $scope.currentOffset -= difference;
                });
            });
        }
    }
});