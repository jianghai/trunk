var fs   = require('fs')

var docPattern = /\/\*\*([\s\S]+?)\*\//g
var docItemPattern = /@([a-z]+)([\s\S]+?)@/g
var docDescPattern = /```([a-z]+)([\s\S]+?)```/g
var trim = function(v) {
  return v.replace(/\n\s*\*/g, '').trim()
}
var docItemHandle = {
  description: function(v) {
    // 分解代码和普通文本描述
    var frags = []
    var match
    var lastIndex = docDescPattern.lastIndex = 0
    while (match = docDescPattern.exec(v)) {
      var index = match.index
      if (index > lastIndex) {
        frags.push(trim(v.slice(lastIndex, index)))
      }
      frags.push({
        lang: match[1],
        code: match[2].replace(/(\n)\s*\*\s/g, '$1').trim()
      })
      lastIndex || (lastIndex = index + match[0].length)
    }
    if (lastIndex < v.length) {
      frags.push(trim(v.slice(lastIndex)))
    }
    return frags
  },
  param: function(v, prop) {
    var param
    v = trim(v).split(' ')
    v[0] = v[0].slice(1, -1)
    param = {
      type: v[0],
      name: v[1],
      desc: v[2]
    }
    if (v[0].charCodeAt(0) === 91) {
      param.type = param.type.slice(1, -1)
      param.optional = true
    }
    (prop.param || (prop.param = [])).push(param)
    return prop.param
  },
  'return': function(v) {
    v = trim(v).split(' ')
    return {
      type: v[0].slice(1, -1),
      desc: v[1]
    }
  }
}

function generate(file) {
  var modules = []
  var module = {}
  var str = fs.readFileSync('public/trunk/src/events.js', 'utf-8')
  module.name = 'events'
  module.props = []
  var match = docPattern.exec(str)
  if (match) {
    if (match[1].indexOf('@fileOverview') > -1) {
      var desc = match[1].trim().match(/\*\s*@fileOverview\s*([\s\S]+)/)[1]
      module.desc = desc.replace(/\s*\*\s*|\n/g, '')
    } else {
      docPattern.lastIndex = 0
    }
  }
  while (match = docPattern.exec(str)) {
    var sub, prop = {}
    match[1] = match[1].trim();
    (match[1].split('* @') || []).forEach(function(item) {
      if (item) {
        var match = item.match(/^([a-z]+)([\s\S]+)/)
        if (match) {
          var handle = docItemHandle[match[1]]
          prop[match[1]] = handle ? handle(match[2], prop) : trim(match[2])
        }
      }
    })
    // console.log(prop)
    module.props.push(prop)
  }
  modules.push(module)
  return modules
}

module.exports = generate