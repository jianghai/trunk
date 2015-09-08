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
  if (!exp.trim()) return
  // scope = this.getScope(exp, scope)
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

var inputHandles = {
  text: function(element, exp, scope) {
    var that = this
    element.value = this.get(exp, scope) || ''
    element.addEventListener('input', function() {
      that.set(exp, this.value, scope)
    })
    this.addWatch(exp, scope, function(value) {
      element.value === value || (element.value = value)
    })
  },
  checkbox: function(element, exp, scope) {
    var that = this
    element.checked = this.get(exp, scope) || false
    element.addEventListener('change', function() {
      that.set(exp, this.checked, scope)
    })
    this.addWatch(exp, scope, function(value) {
      element.checked === value || (element.checked = value)
    })
  }
}

var modelHandles = {
  input: function(element) {
    inputHandles[element.type].apply(this, arguments)
  },
  select: function(element, exp, scope) {

  },
  textarea: function() {

  }
}

var directives = {

  model: function(element, exp, scope) {
    scope = this.getScope(exp, scope)
    this.watch(exp, scope)
    modelHandles[element.tagName.toLowerCase()].apply(this, arguments)
  },

  'class': function() {

  },

  click: function(element, method, scope) {
    var that = this
    element.addEventListener('click', function() {
      typeof scope[method] === 'function' ? scope[method]() : that[method](scope)
    })
  },

  repeat: function(element, exp, scope) {

    exp = exp.split(' in ')

    scope = this.getScope(exp[1], scope)

    this.watch(exp[1], scope)
    var list = this.get(exp[1], scope)

    // 考虑数据不存在的情况
    if (!list) {
      list = []
      this.set(exp[1], list, scope)
    }
    // 阻止循环编译
    element.removeAttribute(d_prefix + 'repeat')

    var context = this
    var container = element.parentNode
    var cloneNode = element.cloneNode(true)
    var docFrag = document.createDocumentFragment()

    function renderOne(item, index, list) {
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
        },
        $remove: {
          configurable: false,
          enumerable: false,
          writable: false,
          value: function() {
            list.splice(index, 1)
            container.removeChild(_cloneNode)
          }
        }
      })

      this.compile(_cloneNode, _data)
      docFrag.appendChild(_cloneNode)
    }

    function render(list) {
      list && list.forEach(function(item, index) {
        renderOne.call(this, item, index, list)
      }, this)
      _.empty(container)
      container.appendChild(docFrag)
    }

    render.call(this, list)

    _.empty(element)

    // Rerender when list reset
    this.addWatch(exp[1], scope, render.bind(this))

    // Observe Array change
    Object.defineProperties(list, {
      push: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
          var len = this.length
          Array.prototype.push.apply(this, arguments)
          for (var i = 0; i < arguments.length; i++) {
            renderOne.call(context, arguments[i], len + i, this)
          }
          container.appendChild(docFrag)
        }
      }
      // splice: {
      //   configurable: false,
      //   enumerable: false,
      //   writable: false,
      //   value: function(start, deleteCount) {
      //     Array.prototype.splice.apply(this, arguments)
      //     var children = container.children
      //     var i = 0
      //     while(i < deleteCount) {
      //       children.removeChild(children[start])
      //       i++
      //     }
      //   }
      // }
    })

    // Stop compile childNodes
  }
}

Object.keys(directives).forEach(function(key) {
  directives[d_prefix + key] = directives[key]
  delete directives[key]
})

p.get = function(exp, scope) {
  var watcher = scope._watchers[exp]
  return watcher.host[watcher.prop]
}

p.set = function(exp, value, scope) {
  var watcher = scope._watchers[exp]
  watcher.host[watcher.prop] = value
}

p.watch = function(exp, scope) {

  var watcher = scope._watchers[exp]
  if (watcher) return
  else watcher = scope._watchers[exp] = {}

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