/**
 * Created by Adrian on 12/28/14.
 */

var services = angular.module('benefisher.services');

var TourService = function () {

    this.startTour = function() {
        initTour();
    };

    function initTour() {
        var tour = {
            id: "benefisher-intro",
            steps: [
                {
                    title: "Welcome to Benefisher!",
                    content: "Welcome to Benefisher! A site that allows you to easily find public services near you. " +
                             "I see this is your first time here. Allow me to show you around.",
                    target: "map-overlay",
                    placement: "top",
                    xOffset: "center",
                    yOffset: "center"

                },
                {
                    title: "My content",
                    content: "Here is where I put my content.",
                    target: "situation_text",
                    placement: "bottom"
                }
            ]
        };

        hopscotch.startTour(tour);
    };
}

services.service('tour', [TourService]);