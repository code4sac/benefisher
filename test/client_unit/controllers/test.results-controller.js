var expect = chai.expect;

describe('ResultsController', function(done) {

    var scope, ctrl;

    // Setup: include benefisher module;
    beforeEach(module('benefisher'))

    beforeEach(inject(function($controller) {
        scope = {};
        ctrl = $controller('ResultsController', {$scope:scope});
    }));

    //Test that hiding an element reduces the size by 1.

    //Test that trying to hide an element when results is 0 doesn't break everything.


});