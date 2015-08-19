// Helpers
var _ = {

  toArray: function(object) {
    return Array.prototype.slice.call(object, 0)
  },

  empty: function(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }
}


function Trunk(options) {

  for (var key in options) {
    this[key] = options[key]

    if (typeof this[key] === 'function') {
      Object.defineProperty(this, key, {
        enumerable: false
      })
    }
  }

  this.data || (this.data = {})

  Object.defineProperty(this, 'el', {
    enumerable: false
  })

  var el = document.querySelector(this.el) || document.body

  Object.defineProperty(this.data, '_watchers', {
    value: {}
  })

  this.compile(el, this.data)
}


var p = Trunk.prototype

/**
 * [compile description]
 * @param  {[type]} node  [description]
 * @return {[type]}       [description]
 */
p.compile = function(node, scope) {

  if (ignoreTags[node.tagName]) return
  // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
  var handle = nodesHandles[node.nodeType]
  if (!handle) return
  handle.call(this, node, scope)
  _.toArray(node.childNodes).forEach(function(node) {
    this.compile(node, scope)
  }, this)
}

p.compileAttribute = function(attribute, scope) {
  var name = attribute.name
  // Todo: use charCodeAt
  if (name.indexOf(d_prefix) !== 0) return
  var exp = attribute.value
  scope = this.getScope(exp, scope)
  directives[name].call(this, attribute.ownerElement, exp, scope)
}

p.getScope = function(exp, scope) {
  var _namespace
  var _match = exp.match(/[\w_]+/)[0]
  while ((_namespace = scope._namespace) && _match !== _namespace) {
    scope = scope._parent
  }
  return scope
}


// Default directive prefix name
var d_prefix = 'd-'

var openRE = '{{'

var closeRE = '}}'

var textPattern = new RegExp(openRE + '(.+?)' + closeRE, 'g')


// Much more
var ignoreTags = {
  SCRIPT: true,
  LINK: true,
  STYLE: true
}

// Handle map for node compile
var nodesHandles = {

  // ELEMENT_NODE
  1: function(node, scope) {
    _.toArray(node.attributes).forEach(function(attribute) {
      this.compileAttribute(attribute, scope)
    }, this)
  },
  
  // TEXT_NODE
  3: function(node, scope) {
    var value = node.nodeValue
    if (/^\s*$/.test(value)) return
    var match
    var fragments = []
    var lastIndex = textPattern.lastIndex = 0
    while ((match = textPattern.exec(value)) != null) {
      var index = match.index
      if (index > lastIndex) {
        fragments.push({
          value: value.slice(lastIndex, index)
        })
      }
      fragments.push({
        isBind: true,
        value: match[0],
        exp: match[1]
      })
      lastIndex = textPattern.lastIndex || index + match[0].length
    }
    if (lastIndex < value.length) {
      fragments.push({
        value: value.slice(lastIndex)
      })
    }
    var docFrag = document.createDocumentFragment()
    fragments.forEach(function(fragment) {
      
      var textNode = document.createTextNode(fragment.value)
      docFrag.appendChild(textNode)
      
      if (fragment.isBind) {
        var exp = fragment.exp
        scope = this.getScope(exp, scope)
        this.watch(exp, scope)
        textNode.nodeValue = this.get(exp, scope) || ''
        this.addWatch(exp, scope, function(value) {
          textNode.nodeValue = value
        })
      }
    }, this)
    node.parentNode.replaceChild(docFrag, node)
  },
  
  // DOCUMENT_NODE
  // 9: function(node, scope) {
  //   _.toArray(node.attributes).forEach(compileAttribute, this)
  // }
}

var directives = {

  model: function(element, exp, scope) {
    this.watch(exp, scope)
    var that = this
    element.value = this.get(exp, scope) || ''
    element.addEventListener('input', function() {
      that.set(exp, this.value, scope)
    })
  },

  // click: function(element, exp, scope) {
  //   var that = this
  //   element.addEventListener('click', function() {
  //     that[value](scope)
  //     //The scope of new Function is global, so pass context through the parameter
  //     // new Function('context', 'context.' + value)(context)
  //   })
  // },

  repeat: function(element, exp, scope) {

    exp = exp.split(' in ')

    this.watch(exp[1], scope)

    // 阻止循环编译
    element.removeAttribute(d_prefix + 'repeat')

    var container = element.parentNode
    var cloneNode = element.cloneNode(true)
    var docFrag = document.createDocumentFragment()

    function render(list) {
      list && list.forEach(function(item) {
        var _cloneNode = cloneNode.cloneNode(true)
        var _data = {}
        _data[exp[0]] = item

        Object.defineProperties(_data, {
          _namespace: {
            value: exp[0]
          },
          _parent: {
            value: scope
          },
          _watchers: {
            value: {}
          }
        })

        this.compile(_cloneNode, _data)
        docFrag.appendChild(_cloneNode)

        // dataBind(list, index)
        // list._dataBind[index].push(function(value) {
        //   compile.call(context, _cloneNode, value)
        // })
      }, this)
      _.empty(container)
      container.appendChild(docFrag)
    }

    render.call(this, this.get(exp[1], scope))

    _.empty(element)

    // Rerender when list reset 
    // data._dataBind[value[1]].push(render)

    // Observe list change
    // Object.defineProperties(data[value[1]], {
    //   push: {
    //     configurable: false,
    //     enumerable: false,
    //     writable: false,
    //     value: function() {
    //       Array.prototype.push.apply(this, arguments)
    //       for (var i = 0, len = arguments.length; i < len; i++) {
    //         var _cloneNode = cloneNode.cloneNode(true)
    //         compileNode.call(context, _cloneNode, arguments[i])
    //         docFrag.appendChild(_cloneNode)
    //       }
    //       container.appendChild(docFrag)
    //     }
    //   },
    //   splice: {
    //     configurable: false,
    //     enumerable: false,
    //     writable: false,
    //     value: function(start, deleteCount) {
    //       Array.prototype.splice.apply(this, arguments)
    //       debugger
    //       console.dir(docFrag)
    //       for (var i = 0; i < deleteCount; i++) {

    //       }
    //       // for (var i = 0, len = arguments.length; i < len; i++) {
    //       //   var _cloneNode = cloneNode.cloneNode(true)
    //       //   compileNode.call(context, _cloneNode, arguments[i])
    //       //   docFrag.appendChild(_cloneNode)
    //       // }
    //       // container.appendChild(docFrag)
    //     }
    //   }
    // })

    // Stop compile childNodes
  }
}

Object.keys(directives).forEach(function(key) {
  directives[d_prefix + key] = directives[key]
  delete directives[key]
})

// p.getWatcher = function(exp) {
//   var _scope = this.scope
//   var watcher
//   while (!(watcher = _scope._watchers[exp])) {
//     _scope = _scope._parent
//   }
//   return watcher
// }

p.get = function(exp, scope) {
  // exp = exp.match(/[\w_]+/g)
  // var data = this.scope
  // exp.every(function(prop) {
  //   data = data[prop]
  //   if (!data) return
  // })
  // return data
  // this.watch(exp)
  var watcher = scope._watchers[exp]
  return watcher.host[watcher.prop]
}

p.set = function(exp, value, scope) {
  // exp = exp.match(/[\w_]+/g)
  // var prop = exp.pop()
  // var data = this.scope
  // exp.forEach(function(prop) {
  //   if (typeof data[prop] !== 'object' || data[prop] === null) data[prop] = {}
  //   data = data[prop]
  // })
  // data[prop] = value
  // console.log(this.data)
  var watcher = scope._watchers[exp]
  watcher.host[watcher.prop] = value
}

p.watch = function(exp, scope) {

  // var _scope = this.scope

  // if (_scope._watchers[exp]) return
  // else {
  //   var _namespace
  //   var _match = exp.match(/[\w_]+/)[0]
  //   while ((_namespace = _scope._namespace) && _match !== _namespace) {
  //     _scope = _scope._parent
  //   }
  // }
  
  var watcher = scope._watchers[exp] = {}

  exp = exp.match(/[\w_]+/g)
  var prop = exp.pop()
  var data = scope
  exp.forEach(function(prop) {
    if (typeof data[prop] !== 'object' || data[prop] === null) data[prop] = {}
    data = data[prop]
  })

  watcher.host = data
  watcher.prop = prop

  this.bind(watcher.host, watcher.prop)
}

p.bind = function(host, prop) {
  if (!host._dataBind) {
    Object.defineProperty(host, '_dataBind', {
      value: {}
    })
  }
  if (!host._dataBind[prop]) {
    Object.defineProperty(host._dataBind, prop, {
      value: []
    })
    var _value = host[prop] || ''
    Object.defineProperty(host, prop, {
      enumerable: true,
      get: function() {
        return _value
      },
      set: function(value) {
        this._dataBind[prop].forEach(function(callback) {
          callback(value)
        })
        _value = value
      }
    })
  }
}

p.addWatch = function(exp, scope, handle) {
  var watcher = scope._watchers[exp]
  watcher.host._dataBind[watcher.prop].push(handle)
}