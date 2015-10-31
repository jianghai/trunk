'use strict'

// var fs = require('fs')

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    webpack: {
      main: {
        entry: "./src/<%= pkg.name %>.js",
        output: {
          path: 'build',
          filename: "<%= pkg.name %>.js",
          library: '<%= pkg.name %>',
          libraryTarget: 'umd'
        }
      }
    },

    uglify: {
      main: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },

    usebanner: {
      src: {
        options: {
          position: 'top',
          process: function(filepath) {
            var path = filepath.replace(/^.*\/|\.js$/g, '')
            return grunt.template.process(
              grunt.file.read('./src.txt'), {
                data: {
                  path: path
                }
              }
            )
          },
          linebreak: true,
          replace: true
        },
        files: {
          src: ['src/**/*.js']
        }
      },
      build: {
        options: {
          position: 'top',
          process: function(filepath) {
            return grunt.template.process(grunt.file.read('./build.txt'))
          },
          linebreak: true
        },
        files: {
          src: ['build/*.js']
        }
      }
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      target: ['src/**/*.js']
    },

    karma: {
      unit: {
        options: {

          // base path that will be used to resolve all patterns (eg. files, exclude)
          basePath: '',


          // frameworks to use
          // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
          frameworks: ['jasmine', 'commonjs'],


          // list of files / patterns to load in the browser
          files: [
            'build/util.js',
            'src/**/*.js',
            'test/index.js'
          ],


          // list of files to exclude
          exclude: [],


          // preprocess matching files before serving them to the browser
          // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
          preprocessors: {
            'build/util.js': ['commonjs'],
            'src/**/*.js': ['commonjs'],
            'test/index.js': ['commonjs']
          },


          // test results reporter to use
          // possible values: 'dots', 'progress'
          // available reporters: https://npmjs.org/browse/keyword/karma-reporter
          reporters: ['progress'],


          hostname: '127.0.0.1',

          // web server port
          port: 9876,


          // enable / disable colors in the output (reporters and logs)
          colors: true,


          // level of logging
          // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
          logLevel: 'INFO',


          // enable / disable watching file and executing tests whenever any file changes
          autoWatch: true,


          // start these browsers
          // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
          // browsers: ['Chrome', 'Firefox', 'Safari'],
          browsers: ['Chrome'],


          // Continuous Integration mode
          // if true, Karma captures browsers, runs the tests and exits
          singleRun: false
        }
      }
    }
  })

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  })

  // grunt.registerTask('banner', function() {
  //   fs.readdirSync('src').forEach(function(file) {
  //     var content = fs.readFileSync('src/' + file, 'utf-8')
  //     content = content.replace(/^.*?=\*\//, fs.readFileSync('banner.txt', 'utf-8'))
  //     fs.writeFileSync('src/' + file, content)
  //   })
  // })

  // Default task(s).
  grunt.registerTask('test', ['jshint', 'karma'])
  grunt.registerTask('build', ['webpack', 'uglify', 'usebanner:build'])
};