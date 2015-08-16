module.exports = function(grunt) {

  var fs = require('fs')
  var jade = require('jade')
  var merge = require('merge')
  var generate = require('./models/doc_generate.js')
  var getComponents = require('./models/getComponents.js')
  var getComponent = require('./models/getComponent.js')
  var highlight = require('./models/highlight/highlight.js')

  grunt.registerTask('pages', function() {

    var filters = jade.filters
    filters.highlight = function(source, option) {
      return highlight(source, option.lang)
    }

    var baseOptions = {
      baseDir: '/trunk/',
      'public': '/trunk/public/'
    }

    var pages = {
      index: {
        path: 'index'
      },
      tutorial: {
        path: 'tutorial/index'
      },
      docs: {
        path: 'docs/index',
        options: {
          doc: generate()
        }
      },
      components: {
        path: 'components/index',
        options: {
          components: getComponents()
        }
      }
    }

    for (var page in pages) {
      var config = pages[page]
      var options = merge({
        page: page
      }, config.options)

      var _dir = config.path.split('/')
      if (_dir.length > 1) {
        if (!fs.existsSync(_dir[0])) {
          fs.mkdirSync(_dir[0])
        }
      }

      fs.writeFileSync(config.path + '.html', jade.compileFile('views/' + config.path + '.jade')(merge(options, baseOptions)))
    }

    var componentsDir = 'views/components/components/'
    fs.readdirSync(componentsDir).forEach(function(file) {
      var stats = fs.statSync(componentsDir + file)
      if (stats.isFile()) {
        var component = file.split('.')[0]
        var _var = getComponent(component)
        var compiled = jade.compileFile('views/components/component.jade', {
          basedir: 'views'
        })({
          component: component,
          source: _var.source,
          code: _var.code
        })
        fs.writeFileSync('components/' + component + '.html', compiled)
      }
    })
  })

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