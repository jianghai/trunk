module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      target: ['src/**/*.js']
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  });

  // Default task(s).
  grunt.registerTask('default', []);

};