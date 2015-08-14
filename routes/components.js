var express = require('express')
var router = express.Router()
var fs = require('fs')
var util = require('util')
var jade = require('jade')
var format = require('dataformat')

var highlight = require('../models/highlight/highlight.js');


// router.use(function(req, res, next) {

//   res.locals.components = {
//     "lineColumn": {
//       "name": "线／柱形图"
//     },
//     "pie": {
//       "name": "饼图"
//     },
//     "dataList": {
//       "name": "数据列表"
//     },
//     "dataTable": {
//       "name": "二维表"
//     },
//     "search": {
//       "name": "搜索",
//       "static": true
//     }
//   }
//   next();
// });

router.get('/', function(req, res, next) {
  var dir = __dirname + '/../public/trunk/components/'
  var files = fs.readdirSync(dir)
  var components = []
  files.forEach(function(file) {
    var status = fs.statSync(dir + file)
    status.file = file
    file = file.split('.')
    status.filename = file[0].charAt(0).toLowerCase() + file[0].slice(1)
    status.fileFormat = file[1]
    if (!fs.existsSync(__dirname + '/../views/components/components/' + status.filename + '.jade')) {
      status.disabled = true
    }
    components.push(status)
  })
  components.forEach(function(component) {
    component.size = format.size(component.size)
    component.mtime = format.date(component.mtime, 'yyyy-mm-dd hh:ii:ss')
    component.atime = format.date(component.atime, 'yyyy-mm-dd hh:ii:ss')
  })
  res.render('components', {
    page: 'components',
    components: components
  })
})

var fileTypeMap = {
  html: 'markup',
  json: 'js'
}

router.get('/:component.html', function(req, res, next) {
  var root = __dirname + '/../'
  var component = req.params.component
  var source = {}
  var code = {}
  var files = {
    jade: root + 'views/components/components/' + component + '.jade',
    js: root + 'public/javascript/components/' + component + '.js',
    json: root + 'public/json/components/' + component + '.json'
  }

  try {
    source.html = jade.compile(fs.readFileSync(files.jade, 'utf-8'), {
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

  res.render('components/component', {
    component: component,
    source: source,
    code: code
  });
});

// router.get('/:component.html', function(req, res, next) {
//   var component = req.params.component
//   var dir = __dirname + '/../public/components/' + component + '/'
//   var source = {}
//   var code = {}
//   fs.readdirSync(dir).forEach(function(file) {
//     var split = file.split('.')
//     var name = split[0]
//     var type = split[1]
//     source[name] = fs.readFileSync(dir + file, 'utf-8')
//     if (type === 'jade') {
//       source[name] = jade.compile(source[name], {
//         basedir: __dirname + '/../views',
//         filename: dir + file,
//         pretty: true
//       })({
//         component: component
//       })
//       type = 'html'
//     }
//     code[name] = highlight(source[name], fileTypeMap[type] || type)
//   })
//   res.render('components/component', {
//     source: source,
//     code: code
//   });
// });

module.exports = router;