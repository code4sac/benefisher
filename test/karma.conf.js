module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'public/components/angular/angular.js',
      'node_modules/chai/chai.js',
      'public/components/angular-mocks/angular-mocks.js',
      'public/components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'public/javascripts/services/*.js',
      'public/javascripts/controllers/*.js',
      'public/javascripts/app.js',
      'test/client_unit/**/*.js'
    ],

    frameworks: ['mocha'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-phantomjs-launcher',
            'karma-mocha'
            ],

    junitReporter : {
      outputFile: 'test/test_out/unit.xml',
      suite: 'unit'
    }

  });
};