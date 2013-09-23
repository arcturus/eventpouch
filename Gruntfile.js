'use strict';

module.exports = function (grunt) {
  // load jshint plugin
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    jshint: {
      options: {
        node: true
      },
      all: [
        'Gruntfile.js',
        'src/*.js'
      ]
    }
  });
};
