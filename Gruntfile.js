'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/eventpouch.js']
        }
      }
    },
    jshint: {
      options: {
        node: true
      },
      all: [
        'Gruntfile.js',
        'src/**/*.js',
        'tests/src/**/*.js',
        'tests/mocks/**/*.js',
        'package.json'
      ]
    },
    watch: {
      files: ['<%= jshint.all %>'],
      tasks: ['jshint', 'mocha-chai-sinon', 'browserify']
    },
    connect: {
      server: {
        options: {
          port: 90210,
          base: '.'
        }
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/eventpouch.js': ['src/*.js']
        }
      },
      options: {
        alias: ['./src/eventpouch.js:eventpouch']
        debug: true
      }
    },
    'mocha-chai-sinon': {
      build: {
        src: ['./tests/**/*.js'],
        options: {
          ui: 'tdd',
          reporter: 'spec'
        }
      },
      coverage: {
        src: ['./src/**/*.js'],
        options: {
          ui: 'tdd',
          reporter: 'html-cov',
          quiet: true,
          captureFile: './build/coverage.html'
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-chai-sinon");

  grunt.registerTask('default', ['jshint', 'browserify', 'uglify', 'connect']);
  grunt.registerTask('test', [
    'mocha-chai-sinon'
  ]);
};
