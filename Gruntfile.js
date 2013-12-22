'use strict';

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/*.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      options: {
        node: true
      },
      all: [
        'Gruntfile.js',
        'src/*.js'
      ]
    },
    watch: {
      files: ['<%= jshint.all %>'],
      tasks: ['jshint', 'mocha-chai-sinon']
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
          'build/eventpouch.js': ['src/*.js'],
        }
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

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'connect']);
  grunt.registerTask('test', [
    'mocha-chai-sinon'
  ]);
};
