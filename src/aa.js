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

  this.compile(el)
}


var p = Trunk.prototype

/**
 * [compile description]
 * @param  {[type]} node  [description]
 * @return {[type]}       [description]
 */
p.compile = function(node) {

  if (ignoreTags[node.tagName]) return
  // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
  var handle = nodesHandles[node.nodeType]
  if (!handle) return
  handle.call(this, node)
  _.toArray(node.childNodes).forEach(function(node) {
    this.compile(node)
  }, this)
}

p.compileAttribute = function(attribute) {
  var name = attribute.name
  // Todo: use charCodeAt
  if (name.indexOf(d_prefix) !== 0) return
  directives[name].call(this, attribute.ownerElement, attribute.value)
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
  1: function(node) {
    _.toArray(node.attributes).forEach(function(attribute) {
      this.compileAttribute(attribute)
    }, this)
  },
  
  // TEXT_NODE
  3: function(node) {
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
        model: match[1]
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
        var model = fragment.model
        this.watch(model)
        textNode.nodeValue = this.get(model) || ''
        this.addWatch(model, function(value) {
          textNode.nodeValue = value
        })
      }
    }, this)
    node.parentNode.replaceChild(docFrag, node)
  },
  
  // DOCUMENT_NODE
  9: function(node) {
    _.toArray(node.attributes).forEach(compileAttribute, this)
  }
}

var directives = {

  model: function(element, value) {
    this.watch(value)
    var that = this
    element.value = this.get(value) || ''
    element.addEventListener('input', function() {
      that.set(value, this.value)
    })
  },

  click: function(element, value) {
    var that = this
    var scope = this.scope
    element.addEventListener('click', function() {
      that[value](scope)
      //The scope of new Function is global, so pass context through the parameter
      // new Function('context', 'context.' + value)(context)
    })
  },

  repeat: function(element, value) {

    var _scope = this.scope

    value = value.split(' in ')

    this.watch(value[1])

    // 阻止循环编译
    element.removeAttribute(d_prefix + 'repeat')

    var container = element.parentNode
    var cloneNode = element.cloneNode(true)
    var docFrag = document.createDocumentFragment()

    function render(list) {
      list && list.forEach(function(item) {
        var _cloneNode = cloneNode.cloneNode(true)
        var _data = {}
        _data[value[0]] = item

        // 设置数据作用域名，为了可以访问父级作用域，提供 parent 接口访问
        this.scope = _data
        Object.defineProperties(this.scope, {
          _namespace: {
            value: value[0]
          },
          _parent: {
            value: _scope
          },
          _watchers: {
            value: {}
          }
        })

        this.compile(_cloneNode)
        docFrag.appendChild(_cloneNode)

        // dataBind(list, index)
        // list._dataBind[index].push(function(value) {
        //   compile.call(context, _cloneNode, value)
        // })
      }, this)
      _.empty(container)
      container.appendChild(docFrag)

      // 编译完成后，返回到父级作用域
      this.scope = _scope
    }

    render.call(this, this.get(value[1]))

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

p.getWatcher = function(exp) {
  var _scope = this.scope
  var watcher
  while (!(watcher = _scope._watchers[exp])) {
    _scope = _scope._parent
  }
  return watcher
}

p.get = function(exp) {
  // exp = exp.match(/[\w_]+/g)
  // var data = this.scope
  // exp.every(function(prop) {
  //   data = data[prop]
  //   if (!data) return
  // })
  // return data
  // this.watch(exp)
  var watcher = this.getWatcher(exp)
  return watcher.host[watcher.prop]
}

p.set = function(exp, value) {
  // exp = exp.match(/[\w_]+/g)
  // var prop = exp.pop()
  // var data = this.scope
  // exp.forEach(function(prop) {
  //   if (typeof data[prop] !== 'object' || data[prop] === null) data[prop] = {}
  //   data = data[prop]
  // })
  // data[prop] = value
  // console.log(this.data)
  var watcher = this.getWatcher(exp)
  watcher.host[watcher.prop] = value
}

p.watch = function(exp) {

  var _scope = this.scope

  if (_scope._watchers[exp]) return
  else {
    var _namespace
    var _match = exp.match(/[\w_]+/)[0]
    while ((_namespace = _scope._namespace) && _match !== _namespace) {
      _scope = _scope._parent
    }
  }
  
  var watcher = _scope._watchers[exp] = {}

  exp = exp.match(/[\w_]+/g)
  var prop = exp.pop()
  var data = _scope
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

p.addWatch = function(exp, handle) {
  var watcher = this.getWatcher(exp)
  watcher.host._dataBind[watcher.prop].push(handle)
}