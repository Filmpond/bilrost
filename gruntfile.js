'use strict';

module.exports = function(grunt) {
  grunt.initConfig ({
    mochaTest: {
      all: {
        options: {
          ui: 'bdd'
        },
        src: ['specs/**/*.js']
      }
    },
    jshint: {
      app:      ['*.js', 'lib/**/*.js'],
      specs:    ['gruntfile.js', 'specs/**/*.js'],
      options : { jshintrc: true }
    }
  });

  [
    'grunt-mocha-test',
    'grunt-contrib-jshint'
  ].forEach(function(task) {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask('default', ['mochaTest', 'jshint']);
};
