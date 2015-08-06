var fs   = require('fs')

var docPattern = /\/\*\*([\s\S]+?)\*\//g
var docItemPattern = /@([a-z]+)([\s\S]+?)@/g
var docDescPattern = /```([a-z]+)([\s\S]+?)```/g
var trim = function(v) {
  return v.replace(/[\n^]\s*\*/g, '').trim()
}
var docItemHandle = {
  desc: function(v) {
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
    if (v[1].charCodeAt(0) === 91) {
      param.name = param.name.slice(1, -1)
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
  // var match = docPattern.exec(str)
  // if (match) {
  //   if (match[1].indexOf('@module') > -1) {
  //     var desc = match[1].trim().match(/\*\s*([\s\S]+?)\*\s@/)
  //     if (desc) {
  //       module.desc = trim(desc[1])
  //     }
  //   } else {
  //     docPattern.lastIndex = 0
  //   }
  // }
  while (match = docPattern.exec(str)) {
    var prop = {}, isModule = false
    var frags = match[1]
    frags = frags.split('* @')
    if (frags) {
      // console.log(frags)
      prop.desc = docItemHandle.desc(frags.splice(0, 1)[0])
      frags.forEach(function(item) {
        if (item) {
          var match = item.match(/^([a-z]+)([\s\S]*)/)
          if (match) {
            var hasHandle = docItemHandle.hasOwnProperty([match[1]])
            var handle = docItemHandle[match[1]]
            prop[match[1]] = hasHandle ? handle(match[2], prop) : trim(match[2])
          }
          if (match[1] === 'module') isModule = true
        }
      })
    }
    // console.log(prop)
    if (isModule) {
      for (var k in prop) {
        module[k] = prop[k]
      }
    } else {
      module.props.push(prop)
    }
  }
  // console.log(module)
  modules.push(module)
  return modules
}

module.exports = generate