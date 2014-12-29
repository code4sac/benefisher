/**
 * Created by Adrian on 12/28/14.
 */

var services = angular.module('benefisher.services');

var TourService = function () {

    this.startTour = function() {
        runTour();
    };

    function runTour() {
        // Creates the steps for the tour. Below are some of the common properties used in making the tour.
        // title: The header of the step.
        // content: The detailed info for the step.
        // target: The id in the Jade files that it will point at.
        // placement: Whether it will be at the left, right, bottom, or top of what it's pointing at.
        var tour = {
            id: "benefisher-intro",
            steps: [
                {
                    title: "Welcome to Benefisher!",
                    content: "Welcome to Benefisher! A site that allows you to easily find public services near you. " +
                             "I see this is your first time here, or you haven't visited in awhile. Allow me to show you around. " +
                             "You can close the tour at anytime by clicking the 'X' in the upper right corner.",
                    target: "map",
                    placement: "top",
                    arrowOffset: "center",
                    xOffset: "center",
                    yOffset: "center"
                },
                {
                    title: "Browse Services",
                    content: "You can pan the map to see which public services are in your area.",
                    target: "map",
                    placement: "top",
                    arrowOffset: "center",
                    xOffset: "center",
                    yOffset: "center"

                },
                {
                    title: "Search by Situation",
                    content: "You can narrow down the number of results by putting your situation in here. Go ahead " +
                             "and click this text box.",
                    target: "situation_textbox",
                    placement: "right",
                    showNextButton: false,
                    nextOnTargetClick: true
                },
                {
                    title: "Situation Tags",
                    content: "This brings up a variety of situations that may fit your current situation. They are " +
                             "organized into different categories. Type in this box to narrow down the list.",
                    target: "situation-tags",
                    placement: "right"

                },
                {
                    title: "Search by Need",
                    content: "You can also narrow down the number of results by putting what you need here. Go ahead " +
                             "and click this text box.",
                    target: "needs_textbox",
                    placement: "left",
                    showNextButton: false,
                    nextOnTargetClick: true
                },
                {
                    title: "Current Needs Tags",
                    content: "This brings up a variety of needs that may fit your current need or needs. You can also " +
                             "type in this box to narrow down the list.",
                    target: "needs-tags",
                    placement: "left"
                },
                {
                    title: "Result Count",
                    content: "The number of results in the area shown on the map will be displayed here. If there are " +
                             "no results in the area, a notification will be displayed here.",
                    target: "results",
                    placement: "left"
                },
                {
                    title: "List of Results",
                    content: "The results will be shown here. You can bring your mouse over a result and be shown its location " +
                             "on the map. If there are multiple results, you can scroll through the list. Go ahead and try it " +
                             "out.",
                    target: "results",
                    placement: "left",
                    yOffset: "center"
                },
                {
                    title: "Expand Result",
                    content: "Click here to expand the result. This will allow you to get more detailed information " +
                             "about the business. Go ahead and click it.",
                    target: "expand",
                    placement: "left",
                    showNextButton: false,
                    nextOnTargetClick: true
                },
                {
                    title: "Minimize Result",
                    content: "Expanding the result will give a detailed description on what the business does, their " +
                             "schedule, and the categories of services they offer. Click again to hide this information.",
                    target: "expand",
                    placement: "left",
                    showNextButton: false,
                    nextOnTargetClick: true
                },
                {
                    title: "Another Way",
                    content: "You can also click here to expand/minimize the result.",
                    target: "result-name",
                    placement: "bottom",
                    arrowOffset: "center",
                    xOffset: "center"
                },
                {
                    title: "Ignore Result",
                    content: "If you are shown a result that doesn't help you at all, or it doesn't have the services " +
                             "you need, click here to not be shown this result again.",
                    target: "remove",
                    placement: "left"
                },
                {
                    title: "All Done!",
                    content: "With Benefisher, we aim to make it easier for you to find benefits. I hope this introduction " +
                             "helps to set you on your way on finding the services you need.",
                    target: "icon",
                    placement: "top",
                    arrowOffset: "center",
                    xOffset: "center"
                }
            ],

            // Sets a cookie so that tour will not be ran again once the tour finishes or is closed out.
            onEnd: function() {
                setCookie("toured", "toured");
            },

            onClose: function() {
                setCookie("toured", "toured");
            }
        };

        // The tour will always start at the beginning, even if a user left the page midway through. This is to prevent
        //  hangups with certain areas of the page not being loaded yet. It will not run if it was finished or closed out.
        if (!getCookie("toured"))
            hopscotch.startTour(tour, 0);
    };

    /**
     * Sets a cookie so that way we can know if the tour already ran recently.
     * @param key - The key we will set for the cookie.
     * @param value - The value that we will give this cookie.
     */
    function setCookie(key, value) {
        var expires = new Date();
        // Sets a cookie that lasts for 60 days.
        expires.setTime(expires.getTime() + (60 * 24 * 60 * 60 * 1000));
        document.cookie = key + '=' + value + ';path=/' + ';expires=' + expires.toUTCString();
    };

    /**
     * Looks to see if we set a cookie to not run the tour.
     * @param key - The key of the cookie to look for.
     * @returns {*}
     */
    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    };
};

services.service('tour', [TourService]);