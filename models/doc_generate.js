var fs   = require('fs')

var docPattern = /\/\*\*([\s\S]+?)\*\//g
var docDescPattern = /```([a-z]+)([\s\S]+?)```/g
var trim = function(v) {
  return v.replace(/[\n^]\s*\*/g, '').trim()
}
var docItemHandle = {
  desc: function(v) {
    // 分解代码和普通文本描述
    var frags = []
    var match
    // lastIndex缓存上一次匹配的lastIndex
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
      lastIndex = docDescPattern.lastIndex
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
      type: v[0].split('|'),
      name: v[1].split('|'),
      desc: v[2]
    }
    // param.name.map(function(name) {
    //   if (name.charCodeAt(0) === 91) {
    //     return name.slice(1, -1)
    //     param.optional = true
    //   }
    // })
    
    ;(prop.param || (prop.param = [])).push(param)
    return prop.param
  },
  'return': function(v) {
    v = trim(v).split(' ')
    return {
      type: v[0].slice(1, -1),
      desc: v[1]
    }
  },
  type: function(v) {
    return v.trim().slice(1, -1)
  } 
}

function parseModule(str, module) {
  docPattern.lastIndex = 0
  module.props = []
  while (match = docPattern.exec(str)) {
    var prop = {}
    var isModule = false
    var isPrivate = false
    var frags = match[1]
    frags = frags.split('* @')
    if (frags.length > 1) {
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
          if (match[1] === 'private') isPrivate = true
        }
      })

      if (isModule && isPrivate) {
        return null
      }
      
      if (isPrivate) continue

      if (isModule) {
        for (var k in prop) {
          module[k] = prop[k]
        }
      } else {
        module.props.push(prop)
      }
    }
  }
  return module
}

function generate(file) {
  var modules = []
  var dir = 'public/trunk/src/'
  var files = fs.readdirSync(dir)
  files.forEach(function(file) {
    file = file.split('.')
    // if (file[0] === 'util') {
      var module = parseModule(fs.readFileSync(dir + file[0] + '.js', 'utf-8'), {
        name: file[0]
      })
      module && modules.push(module)
    // }
  })
  return modules
}

module.exports = generate