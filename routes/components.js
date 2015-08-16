var express = require('express')
var router = express.Router()
var fs = require('fs')
var util = require('util')
var jade = require('jade')

var highlight = require('../models/highlight/highlight.js');
var getComponents = require('../models/getComponents.js');
var getComponent = require('../models/getComponent.js');


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
  res.render('components', {
    page: 'components',
    components: getComponents()
  })
})

// var fileTypeMap = {
//   html: 'markup',
//   json: 'js'
// }

router.get('/:component.html', function(req, res, next) {
  var component = req.params.component
  var _var = getComponent(component)
  res.render('components/component', {
    component: component,
    source: _var.source,
    code: _var.code
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