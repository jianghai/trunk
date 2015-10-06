var Trunk =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var compile = __webpack_require__(1)
	var watch   = __webpack_require__(14)
	var observe = __webpack_require__(15)
	var component = __webpack_require__(17)
	var _       = __webpack_require__(2)


	var unenumerableMap = Object.create(null)
	;['el', 'computed', 'template'].forEach(function(property) {
	  unenumerableMap[property] = true
	})

	function Trunk(options) {

	  typeof options.el === 'string' && (options.el = document.querySelector(options.el))
	  
	  for (var key in options) {
	    this[key] = options[key]

	    if (typeof this[key] === 'function' || unenumerableMap[key]) {
	      Object.defineProperty(this, key, {
	        enumerable: false
	      })
	    }
	  }

	  this.data || (this.data = {})

	  _.merge(this, this.data)
	  delete this.data


	  if (this.computed) {
	    Object.keys(this.computed).forEach(function(k) {
	      var item = this.computed[k]
	      var context = this
	      var _value
	      var _hasGet = false
	      Object.defineProperty(this, k, {
	        configurable: true,
	        enumerable: true,
	        get: function() {
	          if (!_hasGet) {
	            // 记录Computed自身的依赖
	            if (this._computer) {
	              this._computs || Object.defineProperty(this, '_computs', {
	                value: {}
	              })
	              this._computs[k] || (this._computs[k] = [])
	              if (this._computs[k].indexOf(this._computer) === -1) {
	                this._computs[k].push(this._computer)
	              }
	            }
	            // 初始化绑定依赖
	            this._computer = {
	              key: k,
	              handle: item
	            }
	            _value = item.call(this)
	            _hasGet = true
	            this._computer = null
	          }
	          return _value
	        }
	      })
	    }, this)
	    delete this.computed
	  }

	  this.observe(this)

	  Object.defineProperty(this, '_watchers', {
	    value: {}
	  })

	  this.compileNode(this.el || document.body, this)
	}

	Trunk.component = component
	var p = Trunk.prototype
	p.components = {}
	p.observe = observe
	_.merge(p, compile)
	_.merge(p, watch)

	module.exports = Trunk

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _          = __webpack_require__(2)
	var directives = __webpack_require__(5)
	var config     = __webpack_require__(6)
	var watch      = __webpack_require__(14)


	var textPattern = new RegExp(config.openRE + '(.+?)' + config.closeRE, 'g')

	var nodeTypeHandles = {

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
	    while ((match = textPattern.exec(value)) !== null) {
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
	        this.watch(exp, scope)
	        textNode.nodeValue = this.get(exp, scope)
	        this.addDeps(exp, function(value) {
	          textNode.nodeValue = value
	        }, scope)
	      }
	    }, this)
	    node.parentNode.replaceChild(docFrag, node)
	  },

	  // DOCUMENT_NODE
	  // 9: function(node, scope) {
	  //   _.toArray(node.attributes).forEach(compileAttribute, this)
	  // }
	}

	var ignoreTags = Object.create(null)
	;['script', 'link', 'style', 'template'].forEach(function(tagName) {
	  ignoreTags[tagName.toUpperCase()] = true
	})

	var ignoreWatchs = Object.create(null)
	;['click'].forEach(function(directive) {
	  ignoreWatchs[config.d_prefix + directive] = true
	})

	exports.compileAttribute = function(attribute, scope) {
	  var name = attribute.name
	  var exp

	  if (!directives[name]) return

	  exp = attribute.value

	  // Initialize getter & setter
	  ignoreWatchs[name] || this.watch(exp, scope)
	  directives[name].call(this, attribute.ownerElement, exp, scope)
	}

	exports.compileNode = function(node, scope) {

	  var handle = nodeTypeHandles[node.nodeType]
	  if (!handle) return

	  if (node.tagName) {
	    // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
	    if (ignoreTags[node.tagName]) return

	    var component = this.components[node.tagName.toLowerCase()]
	    if (component) {
	      node.parentNode.replaceChild(component.el.cloneNode(true), node)
	      return
	    }
	  }

	  handle.call(this, node, scope)
	  _.toArray(node.childNodes).forEach(function(node) {
	    this.compileNode(node, scope)
	  }, this)
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var lang = __webpack_require__(3)

	lang.merge(exports, lang)
	lang.merge(exports, __webpack_require__(4))

/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.toArray = function(arrayLike) {
	  return Array.prototype.slice.call(arrayLike, 0)
	}

	exports.merge = function(host, extend) {
	  for (var k in extend) {
	    extend.hasOwnProperty(k) && (host[k] = extend[k])
	  }
	}

	exports.isArray = function(array) {
	  return Object.prototype.toString.call(array) === '[object Array]'
	}

	exports.isObject = function(obj) {
	  return typeof obj === 'object' && obj !== null
	}

	exports.bind = function(fn, context) {
	  return function() {
	    return fn.apply(context, arguments)
	  }
	}

	exports.initialize = function(host, value) {
	  var args = arguments
	  var len = args.length - 1
	  var lastProp = args[len]
	  var i = 2
	  while (i < len) {
	    var prop = args[i++]
	    host.hasOwnProperty(prop) || Object.defineProperty(host, prop, {
	      value: {}
	    })
	    host = host[prop]
	  }
	  host.hasOwnProperty(lastProp) || Object.defineProperty(host, lastProp, {
	    value: value
	  })
	  return host[lastProp]
	}

	exports.mapParse = function(map, callback, context) {
	  map.split(',').forEach(function(item) {
	    item = item.trim().split(':')
	    callback.call(this, item[0], item[1].trim())
	  }, context)
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	exports.index = function(parent, child) {
	  return Array.prototype.indexOf.call(parent.children, child)
	}

	exports.toggleClass = function(element, className, condition) {
	  element.classList.toggle(className, condition)
	}

	exports.empty = function(element) {
	  while (element.firstChild) {
	    element.removeChild(element.firstChild)
	  }
	}

	exports.on = function(element, type, method, scope, context) {
	  element.addEventListener(type, function() {
	    typeof scope[method] === 'function' ? scope[method]() : context[method](scope)
	  })
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(6)

	var directives = Object.create(null)

	;[
	  'click',
	  'change',
	  'class',
	  'model',
	  'repeat',
	  'on'
	].forEach(function(directive) {
	  directives[config.d_prefix + directive] = __webpack_require__(7)("./" + directive)
	})

	module.exports = directives

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {

	  d_prefix: 'd-',

	  openRE: '{{',

	  closeRE: '}}'
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./change": 8,
		"./change.js": 8,
		"./class": 9,
		"./class.js": 9,
		"./click": 10,
		"./click.js": 10,
		"./index": 5,
		"./index.js": 5,
		"./model": 11,
		"./model.js": 11,
		"./on": 12,
		"./on.js": 12,
		"./repeat": 13,
		"./repeat.js": 13
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 7;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, method, scope) {
	  _.on(element, 'change', method, scope, this)
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, map, scope) {
	  _.mapParse(map, function(name, condition) {
	    this.watch(condition, scope)
	    _.toggleClass(element, name, this.get(condition, scope))
	    this.addDeps(condition, function(value) {
	      _.toggleClass(element, name, value)
	    }, scope)
	  }, this)
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, method, scope) {
	  _.on(element, 'click', method, scope, this)
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	
	var inputHandles = {

	  text: function(element, exp, scope) {
	    var self = this
	    element.value = this.get(exp, scope)
	    element.addEventListener('input', function() {
	      self.set(exp, this.value, scope)
	    })
	    this.addDeps(exp, function(value) {
	      element.value === value || (element.value = value)
	    }, scope)
	  },

	  checkbox: function(element, exp, scope) {
	    var self = this
	    element.checked = this.get(exp, scope)
	    element.addEventListener('change', function() {
	      self.set(exp, this.checked, scope)
	    })
	    this.addDeps(exp, function(value) {
	      element.checked === value || (element.checked = value)
	    }, scope)
	  }
	}

	var modelHandles = {

	  input: function(element) {
	    inputHandles[element.type].apply(this, arguments)
	  },
	  
	  select: function(element, exp) {

	  },
	  
	  textarea: function() {

	  }
	}

	module.exports = function(element, exp, scope) {
	  modelHandles[element.tagName.toLowerCase()].apply(this, arguments)
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, map, scope) {
	  _.mapParse(map, function(type, method) {
	    _.on(element, type, method, scope, this)
	  }, this)
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(6)
	var _ = __webpack_require__(2)

	module.exports = function(element, exp, scope) {

	  var list = this.get(exp, scope)

	  // Prevent cycle compile
	  element.removeAttribute(config.d_prefix + 'repeat')

	  var context = this
	  var container = element.parentNode
	  var cloneNode = element.cloneNode(true)
	  var docFrag = document.createDocumentFragment()
	  var childNodes = [element]

	  // Stop compile childNodes
	  _.empty(element)

	  function renderOne(item, list) {
	    var _cloneNode = cloneNode.cloneNode(true)
	    var _data = item

	    _data._watchers || Object.defineProperties(_data, {
	      _watchers: {
	        value: {}
	      },
	      $remove: {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: function() {
	          list.splice(childNodes.indexOf(_cloneNode), 1)
	        }
	      }
	    })

	    this.compileNode(_cloneNode, _data)
	    docFrag.appendChild(_cloneNode)
	    return _cloneNode
	  }

	  function render(list) {

	    childNodes.forEach(function(childNode) {
	      container.removeChild(childNode)
	    })

	    childNodes.length = []

	    list && list.forEach(function(item) {
	      childNodes.push(renderOne.call(this, item, list))
	    }, this)

	    container.appendChild(docFrag)

	    var handles = {
	      
	      push: function() {
	        var args = arguments
	        for (var i = 0, len = args.length; i < len; i++) {
	          childNodes.push(renderOne.call(context, args[i], this))
	        }
	        container.appendChild(docFrag)
	      },
	      
	      splice: function(start, deleteCount) {
	        var i = 0
	        while (i < deleteCount) {
	          container.removeChild(childNodes[start + i])
	          i++
	        }
	        childNodes.splice(start, deleteCount)

	        var args = arguments
	        if (args.length > 2) {
	          for (var i = 2, len = args.length; i < len; i++) {
	            childNodes.splice(start, 0, renderOne.call(context, args[i], this))
	          }
	          container.insertBefore(docFrag, childNodes[start + len - 2])
	        }
	      }
	    }

	    for (var k in handles) {
	      _.initialize(list, [], 'on' + k)
	      list['on' + k].push(handles[k])
	    }
	  }

	  render.call(this, list)

	  // Rerender when list reset
	  this.addDeps(exp, _.bind(render, this), scope)
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	exports.watch = function(exp, scope) {

	  if (scope._watchers[exp]) return

	  scope._watchers[exp] = {
	    getter: new Function('scope', 'return scope.' + exp),
	    setter: new Function('value', 'scope', 'scope.' + exp + ' = value')
	  }
	}

	exports.get = function(exp, scope) {
	  var value
	  try {
	    value = scope._watchers[exp].getter(scope)
	  } catch (e) {
	    value = ''
	  }
	  return value
	}

	exports.set = function(exp, value, scope) {
	  scope._watchers[exp].setter(value, scope)
	}

	// exports.getScope = function(exp, scope) {
	//   var _namespace
	//   var _match = exp.match(/[\w_]+/)[0]
	//   while ((_namespace = scope._namespace) && _match !== _namespace) {
	//     scope = scope._parent
	//   }
	//   return scope
	// }

	exports.addDeps = function(exp, cb, scope) {

	  var getter = scope._watchers[exp].getter
	  var host = scope
	  var match = exp.match(/[\w_]+/g)
	  var handle = {
	    scope: scope,
	    getter: getter,
	    cb: cb
	  }

	  host._deps || Object.defineProperty(host, '_deps', {
	    value: {}
	  })

	  var deps = host._deps
	  var i = 0
	  var len = match.length

	  while (i < len) {

	    var key    = match[i]
	    var isLast = i + 1 === len

	    deps[key] || (deps[key] = {})
	    deps = deps[key]
	    deps.handles || (deps.handles = [])
	    deps.handles.push(handle)

	    if (!isLast) {
	      deps.sub || (deps.sub = {})
	      deps = deps.sub
	    }

	    // 如果子对象存在，绑定依赖，已经有依赖的扩展依赖
	    if (host) {
	      if (i > 0 && _.isObject(host)) {
	        var handles = _.initialize(host, [], '_deps', key, 'handles')
	        handles.push(handle)
	        isLast || (host._deps[key].sub = deps)
	      }
	      host = host[key]
	    }

	    i++
	  }
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var _            = __webpack_require__(2)
	var ObserveArray = __webpack_require__(16)

	function _bindDeps(value, deps) {
	  Object.defineProperty(value, '_deps', {
	    value: deps
	  })
	  for (var k in deps) {
	    if (deps[k].sub && _.isObject(value[k])) {
	      _bindDeps(value[k], deps[k].sub)
	    }
	  }
	}

	function _observeArray(host, key, context) {
	  var array = host[key]
	  var isArray = _.isArray(array)
	  if (isArray) {
	    new ObserveArray(host, key, context)
	    for (var i = 0, len = array.length; i < len; i++) {
	      _.isObject(array[i]) && context.observe(array[i])
	    }
	  }
	  return isArray
	}

	function _observe(obj, k) {

	  var context = this
	  var _value = obj[k]

	  function getter() {
	    if (context._computer) {
	      _.initialize(this, [], '_computs', k)
	      var _computs = this._computs[k]
	      if (_computs.indexOf(context._computer) === -1) {
	        _computs.push(context._computer)
	      }
	    }
	    return _value
	  }

	  function setter(value) {
	    _value = value
	    

	    if (_.isObject(value)) {
	      
	      _observeArray(this, k, context) || context.observe(value)

	      var sub = this._deps && this._deps[k] && this._deps[k].sub
	      sub && _bindDeps(value, sub)
	    }

	    if (this._deps && this._deps[k]) {
	      this._deps[k].handles.forEach(function(item) {
	        var value
	        try {
	          value = item.getter(item.scope)
	        } catch (e) {
	          value = ''
	        }
	        item.cb(value)
	      }, this)
	    }
	    
	    if (this._computs && this._computs[k]) {
	      this._computs[k].forEach(function(item) {
	        var value
	        try {
	          value = item.handle.call(context)
	        } catch (e) {
	          value = ''
	        }
	        context[item.key] = value
	      })
	    }
	  }
	  Object.defineProperty(obj, k, {
	    get: getter,
	    set: setter
	  })
	}

	/**
	 * Define getter/setter for all enumerable properties to record computed handles and invokes 
	 * depends & computed handles, redefine when the value of setter is object.
	 * 
	 * @param {object} obj The Object of define getter/setter
	 */
	function observe(obj) {

	  for (var k in obj) {
	    if (obj.hasOwnProperty(k)) {
	      _observe.call(this, obj, k)
	      var _value = obj[k]
	      if (!_observeArray(obj, k, this)) {
	        _.isObject(_value) && this.observe(_value)
	      }
	    }
	  }
	}

	module.exports = observe

/***/ },
/* 16 */
/***/ function(module, exports) {

	
	function ObserveArray(host, key, context) {
	  this.host = host
	  this.key = key
	  this.context = context

	  var list = host[key]

	  ;['push', 'splice', 'sort'].forEach(function(method) {

	    var self = this

	    Object.defineProperty(list, method, {
	      configurable: true,
	      enumerable: false,
	      writable: false,
	      value: function() {

	        var args = arguments
	        Array.prototype[method].apply(this, args)

	        this['on' + method] && this['on' + method].forEach(function(fn) {
	          fn.apply(this, args)
	        }, this)

	        self.hasComputs = !!(self.host._computs && self.host._computs[self.key])

	        self[method] && self[method].apply(self, args)
	      }
	    })
	  }, this)
	}

	ObserveArray.prototype.push = function() {
	  var args = arguments
	  for (var i = 0; i < args.length; i++) {
	    this.context.observe(args[i])
	  }
	  if (this.hasComputs) {
	    this.host._computs[this.key].forEach(function(item) {
	      this._computer = item
	      var _value = item.handle.call(this)
	      this._computer = null
	      this[item.key] = _value
	    }, this.context)
	  }
	}

	ObserveArray.prototype.splice = function() {
	  var args = arguments
	  if (args.length > 2) {
	    this.push.apply(this, Array.prototype.slice.call(args, 2))
	  } else {
	    if (this.hasComputs) {
	      this.host._computs[this.key].forEach(function(item) {
	        this[item.key] = item.handle.call(this)
	      }, this.context)
	    }
	  }
	}

	ObserveArray.prototype.sort = function() {
	  this.host[this.key] = this.host[this.key]
	}

	module.exports = ObserveArray

/***/ },
/* 17 */
/***/ function(module, exports) {

	
	function component(name, options) {

	  options.el = document.querySelector(options.template).content.firstElementChild

	  this.prototype.components[name] = new this(options)
	}

	module.exports = component

/***/ }
/******/ ]);