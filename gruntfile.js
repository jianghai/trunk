module.exports = function(grunt) {

  var fs   = require('fs');
  var jade = require('jade');

  grunt.registerTask('generate', function() {
    var fn = jade.compileFile('views/index.jade');
    fs.writeFileSync('index.html', fn({
      title: 'BBBB'
    }));
  });

  // Project configuration.
  // grunt.initConfig({
  //   pkg: grunt.file.readJSON('package.json'),
  //   uglify: {
  //     options: {
  //       banner: '/**\n' +
  //         ' * <%= pkg.name %>.min.js \n' +
  //         ' * http://github.com/jianghai/<%= pkg.name %>\n' +
  //         ' */\n'
  //     },
  //     build: {
  //       src: '<%= pkg.name %>.js',
  //       dest: '<%= pkg.name %>.min.js'
  //     }
  //   }
  // });

  // // These plugins provide necessary tasks.
  // require('load-grunt-tasks')(grunt, {
  //   scope: 'devDependencies'
  // });

  // Default task(s).
  // grunt.registerTask('default', ['uglify']);

};