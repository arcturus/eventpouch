'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-open');

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
        alias: ['./src/eventpouch.js:eventpouch'],
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
    },
    open: {
      chrome: {
        path: 'http://127.0.0.1:<%= connect.server.options.port %>/example/',
        app: 'Google Chrome'
      },
      firefox: {
        path: 'http://127.0.0.1:<%= connect.server.options.port %>/example/',
        app: 'Firefox'
      },
      safari: {
        path: 'http://127.0.0.1:<%= connect.server.options.port %>/example/',
        app: 'Safari'
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-chai-sinon");

  grunt.registerTask('default', ['jshint', 'test', 'browserify', 'uglify']);
  grunt.registerTask('test', [
    'mocha-chai-sinon'
  ]);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('open-example', ['default', 'connect', 'open:firefox', 'watch']);
  grunt.registerTask('open-example-chrome', ['default', 'connect', 'open:chrome', 'watch']);
  grunt.registerTask('open-example-safari', ['default', 'connect', 'open:safari', 'watch']);
};
