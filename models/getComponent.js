var fs = require('fs')
var jade = require('jade')

var highlight = require('./highlight/highlight.js')

module.exports = function(component) {
  var root = __dirname + '/../'
  var source = {}
  var code = {}
  var files = {
    jade: root + 'views/components/components/' + component + '.jade',
    js: root + 'public/javascript/components/' + component + '.js',
    json: root + 'public/json/components/' + component + '.json'
  }

  try {
    source.html = jade.compileFile(files.jade, {
      basedir: root + 'views',
      filename: files.jade,
      pretty: true
    })({
      component: component
    })
    code.html = highlight(source.html, 'markup')
    code.js = highlight(fs.readFileSync(files.js, 'utf-8'), 'js')
    code.json = highlight(fs.readFileSync(files.json, 'utf-8'), 'js')
  } catch (e) {}

  return {
    source: source,
    code: code
  }
}