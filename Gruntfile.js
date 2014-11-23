module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    },
    express: {
      dev: {
        options: {
          port: 3000,
          script: 'bin/www'
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/stylesheets/style.css' : 'public/stylesheets/style.scss'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'nyan',
          clearRequireCache: true
        },
        src: ['test/server_*/*.js']
      }
    },
    karma: {
      unit: {
        singleRun: true,
        configFile: 'test/karma.conf.js'
      }
    },
    watch: {
      css: {
        files: '**/*.scss',
        tasks: ['sass']
      },
      js: {
        files:  [ 'app.js', 'routes/**/*.js', 'controllers/**/*.js', 'models/**/*.js', 'public/javascripts/**/*.js', 'test/**/*.js', 'services/**/*.js' ],
        tasks:  [ 'express:dev', 'test' ],
        options: {
          spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
        }
      }
    }
  });

  grunt.registerTask('build', ['bower:install']);
  grunt.registerTask('test', ['mochaTest', 'karma:unit']);
  grunt.registerTask('dev', [ 'express:dev', 'watch' ]);
}