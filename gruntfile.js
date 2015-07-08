module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/**\n' +
          ' * <%= pkg.name %>.min.js \n' +
          ' * http://github.com/jianghai/<%= pkg.name %>\n' +
          ' */\n'
      },
      build: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  });

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};