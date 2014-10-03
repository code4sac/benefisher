module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'public/components/angular/angular.js',
      'public/components/angular-sanitize/angular-sanitize.min.js',
      'public/components/angular-mocks/angular-mocks.js',
      'public/components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'public/javascripts/controllers/*.js',
      'public/javascripts/services.js',
      'public/javascripts/app.js',
      'public/javascripts/services/*.js',
      'node_modules/chai/chai.js',
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/sinon-chai/lib/sinon-chai.js',
      'test/client_unit/**/*.js'
    ],

    frameworks: ['mocha'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-phantomjs-launcher',
            'karma-nyan-reporter',
            'karma-mocha'
            ],

    reporters: ['nyan'],

    junitReporter : {
      outputFile: 'test/test_out/unit.xml',
      suite: 'unit'
    }

  });
};