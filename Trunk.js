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
	var watch   = __webpack_require__(12)
	var observe = __webpack_require__(13)
	var _       = __webpack_require__(2)


	var unenumerableMap = Object.create(null)
	;['el', 'computed'].forEach(function(property) {
	  unenumerableMap[property] = true
	})

	function Trunk(options) {

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
	      Object.defineProperty(this, k, {
	        configurable: true,
	        enumerable: true,
	        get: function() {
	          if (!_value) {
	            if (this._computer) {
	              this._computs || Object.defineProperty(this, '_computs', {
	                value: {}
	              })
	              this._computs[k] || (this._computs[k] = [])
	              if (this._computs[k].indexOf(this._computer) === -1) {
	                this._computs[k].push(this._computer)
	              }
	            }
	            this._computer = {
	              key: k,
	              handle: item
	            }
	            _value = item.call(this)
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

	  this.compileNode(document.querySelector(this.el) || document.body, this)
	}

	var p = Trunk.prototype
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
	var watch      = __webpack_require__(12)


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
	;['script', 'link', 'style'].forEach(function(tagName) {
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

	  // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
	  if (ignoreTags[node.tagName]) return

	  var handle = nodeTypeHandles[node.nodeType]
	  if (!handle) return
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

	exports.initialize = function(obj, key, value) {
	  obj[key] || Object.defineProperty(obj, key, {
	    value: value
	  })
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
		"./change": 15,
		"./change.js": 15,
		"./class": 8,
		"./class.js": 8,
		"./click": 9,
		"./click.js": 9,
		"./index": 5,
		"./index.js": 5,
		"./model": 10,
		"./model.js": 10,
		"./on": 18,
		"./on.js": 18,
		"./repeat": 11,
		"./repeat.js": 11
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, method, scope) {
	  _.on(element, 'click', method, scope, this)
	}

/***/ },
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(6)
	var _      = __webpack_require__(2)

	module.exports = function(element, exp, scope) {

	  // exp = exp.split(' in ')

	  // scope = this.getScope(exp[1], scope)

	  var list = this.get(exp, scope)

	  if (!list) {
	    list = []
	    this.set(exp, list, scope)
	  }
	  
	  // Prevent cycle compile
	  element.removeAttribute(config.d_prefix + 'repeat')

	  var context = this
	  var container = element.parentNode
	  var cloneNode = element.cloneNode(true)
	  var docFrag = document.createDocumentFragment()

	  function renderOne(item, list) {
	    var _cloneNode = cloneNode.cloneNode(true)
	    // var _data = {}
	    // _data[exp[0]] = item
	    var _data = item

	    Object.defineProperties(_data, {
	      // _namespace: {
	      //   value: exp[0]
	      // },
	      // _parent: {
	      //   value: scope
	      // },
	      _watchers: {
	        value: {}
	      },
	      $remove: {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: function() {
	          list.splice(_.index(container, _cloneNode), 1)
	        }
	      }
	    })

	    this.compileNode(_cloneNode, _data)
	    docFrag.appendChild(_cloneNode)
	  }

	  function render(list) {
	    list && list.forEach(function(item) {
	      renderOne.call(this, item, list)
	    }, this)
	    _.empty(container)
	    container.appendChild(docFrag)
	  }

	  render.call(this, list)

	  // Rerender when list reset
	  this.addDeps(exp, _.bind(render, this), scope)

	  ;['push', 'splice'].forEach(function(method) {
	    _.initialize(list, '_on' + method, [])
	  })

	  list._onpush.push(function() {
	    var args = arguments
	    for (var i = 0; i < args.length; i++) {
	      renderOne.call(context, args[i], this)
	    }
	    container.appendChild(docFrag)
	  })

	  list._onsplice.push(function(start, deleteCount) {
	    var children = container.children
	    var i = 0
	    while(i < deleteCount) {
	      container.removeChild(children[start])
	      i++
	    }
	  })

	  // Stop compile childNodes
	  _.empty(element)
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	function isWatching(exp, scope) {
	  return !!scope._watchers[exp]
	}

	exports.watch = function(exp, scope) {

	  if (isWatching(exp, scope)) return

	  var match = exp.match(/[\w_]+/g)
	  var prop = match.pop()
	  var _host = scope
	  match.forEach(function(prop) {
	    if (typeof _host[prop] !== 'object' || _host[prop] === null) {
	      _host[prop] = {}
	      this.observe(_host, prop)
	      // _host._deps.push(function(value) {
	      //   _host[prop] = value[prop]
	      // })
	    }
	    _host = _host[prop]
	  }, this)
	  if (!(prop in _host)) {
	    _host[prop] = undefined
	  }
	  this.observe(_host, prop)
	  scope._watchers[exp] = {
	    host: _host,
	    prop: prop
	  }
	}

	exports.get = function(exp, scope) {
	  var target = scope._watchers[exp]
	  var value = target.host[target.prop]
	  value === undefined && (value = '')
	  return value
	}

	exports.set = function(exp, value, scope) {
	  var target = scope._watchers[exp]
	  target.host[target.prop] = value
	}

	// exports.getScope = function(exp, scope) {
	//   var _namespace
	//   var _match = exp.match(/[\w_]+/)[0]
	//   while ((_namespace = scope._namespace) && _match !== _namespace) {
	//     scope = scope._parent
	//   }
	//   return scope
	// }

	exports.addDeps = function(exp, fn, scope) {
	  var target = scope._watchers[exp]

	  _.initialize(target.host, '_deps', {})
	  var _deps = target.host._deps
	  _deps[target.prop] || (_deps[target.prop] = [])

	  _deps[target.prop].push(fn)
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	var arrayMap = Object.create(null)

	arrayMap.push = function(hasComputs, host, key, args) {
	  for (var i = 0; i < args.length; i++) {
	    this.observe(args[i])
	  }
	  if (hasComputs) {
	    host._computs[key].forEach(function(item) {
	      this._computer = item
	      item._value = item.handle.call(this)
	      this._computer = null
	    }, this)
	  }
	}

	function bindArray(host, key) {

	  ['push', 'splice'].forEach(function(method) {

	    var context = this

	    Object.defineProperty(host[key], method, {
	      configurable: true,
	      enumerable: false,
	      writable: false,
	      value: function() {

	        var args = arguments
	        Array.prototype[method].apply(this, args)

	        var _on = '_on' + method
	        this[_on] && this[_on].forEach(function(fn) {
	          fn.apply(this, args)
	        }, this)

	        var hasComputs = !!(host._computs && host._computs[key])

	        arrayMap[method] && arrayMap[method].call(context, hasComputs, host, key, arguments)

	        if (hasComputs) {
	          host._computs[key].forEach(function(item) {
	            context[item.key] = item._value
	            delete item._value
	          })
	        }
	      }
	    })
	  }, this)
	}

	function observe(obj, k) {

	  if (k === undefined) {
	    Object.keys(obj).forEach(function(k) {
	      this.observe(obj, k)
	    }, this)
	    return
	  }

	  var context = this
	  var _value = obj[k]

	  Object.defineProperty(obj, k, {

	    get: function() {

	      if (context._computer) {
	        this._computs || Object.defineProperty(this, '_computs', {
	          value: {}
	        })
	        this._computs[k] || (this._computs[k] = [])

	        if (this._computs[k].indexOf(context._computer) === -1) {
	          this._computs[k].push(context._computer)
	        }
	      }
	      return _value
	    },

	    set: function(value) {

	      _value = value

	      if (this._deps && this._deps[k]) {
	        this._deps[k].forEach(function(fn) {
	          fn(value)
	        })
	      }
	      if (this._computs && this._computs[k]) {
	        this._computs[k].forEach(function(item) {
	          context[item.key] = item.handle.call(context)
	        })
	      }
	    }
	  })

	  _.isArray(_value) && bindArray.call(this, obj, k)

	  _.isObject(obj[k]) && this.observe(obj[k])
	}

	module.exports = observe

/***/ },
/* 14 */,
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, method, scope) {
	  _.on(element, 'change', method, scope, this)
	}

/***/ },
/* 16 */,
/* 17 */,
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2)

	module.exports = function(element, map, scope) {
	  _.mapParse(map, function(type, method) {
	    _.on(element, type, method, scope, this)
	  }, this)
	}

/***/ }
/******/ ]);