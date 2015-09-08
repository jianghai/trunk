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
	var observe = __webpack_require__(7)

	function Trunk(options) {

	  for (var key in options) {
	    this[key] = options[key]

	    // if (typeof this[key] === 'function') {
	    //   Object.defineProperty(this, key, {
	    //     enumerable: false
	    //   })
	    // }
	  }

	  this.data || (this.data = {})

	  // Object.defineProperty(this, 'el', {
	  //   enumerable: false
	  // })
	  
	  observe(this.data)

	  if (this.computed) {
	    observe(this.computed)
	    Object.keys(this.computed).forEach(function(k) {
	      var fn = this.computed[k]
	      var that = this
	      observe._computerSetter = function() {
	        that.computed[k] = fn.call(that)
	      }
	      fn.value = fn.call(this)
	      observe._computerSetter = null
	    }, this)
	  }

	  Object.defineProperty(this.data, '_watchers', {
	    value: {}
	  })

	  this.compileNode(document.querySelector(this.el) || document.body, this.data)
	}

	var p = Trunk.prototype
	_.merge(p, compile)
	// _.merge(p, compile)
	// _.merge(p, compile)

	module.exports = Trunk

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _          = __webpack_require__(2)
	var directives = __webpack_require__(3)
	var config     = __webpack_require__(5)
	var watch     = __webpack_require__(6)


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
	        watch.call(this, exp, scope)
	        textNode.nodeValue = watch.get.call(this, exp, scope) || ''
	        watch.addDeps.call(this, exp, function(value) {
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

	// Much more
	var ignoreTags = {
	  SCRIPT: true,
	  LINK: true,
	  STYLE: true
	}

	exports.compileAttribute = function(attribute, scope) {
	  var name = attribute.name
	  // Todo: use charCodeAt
	  if (name.indexOf(config.d_prefix) !== 0) return
	  var exp = attribute.value
	  if (!exp.trim()) return

	  // Initialize getter & setter
	  watch.call(this, exp, scope)
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
/***/ function(module, exports) {

	module.exports = {

	  toArray: function(arrayLike) {
	    return Array.prototype.slice.call(arrayLike, 0)
	  },

	  empty: function(element) {
	    while (element.firstChild) {
	      element.removeChild(element.firstChild)
	    }
	  },

	  merge: function(host, extend) {
	    for (var k in extend) {
	      extend.hasOwnProperty(k) && (host[k] = extend[k])
	    }
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var config     = __webpack_require__(5)

	var directives = {
	  model: __webpack_require__(4)
	}
	Object.keys(directives).forEach(function(key) {
	  directives[config.d_prefix + key] = directives[key]
	  delete directives[key]
	})
	module.exports = directives

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var watch = __webpack_require__(6)

	var inputHandles = {

	  text: function(element, exp, scope) {
	    element.value = watch.get.call(this, exp, scope) || ''
	    element.addEventListener('input', function() {
	      watch.set(exp, this.value, scope)
	    })
	    watch.addDeps.call(this, exp, function(value) {
	      element.value === value || (element.value = value)
	    }, scope)
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
	  
	  select: function(element, exp) {

	  },
	  
	  textarea: function() {

	  }
	}

	module.exports = function(element, exp, scope) {
	  // scope = this.getScope(exp, scope)
	  // this.watch(exp, scope)
	  modelHandles[element.tagName.toLowerCase()].apply(this, arguments)
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {

	  d_prefix: 'd-',

	  openRE: '{{',

	  closeRE: '}}'
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var observe = __webpack_require__(7)

	function isWatching(exp, scope) {
	  return !!scope._watchers[exp]
	}

	function watch(exp, scope) {

	  if (this.computed[exp]) return
	   
	  if (isWatching(exp, scope)) return

	  var match = exp.match(/[\w_]+/g)
	  var prop = match.pop()
	  var _host = scope
	  match.forEach(function(prop) {
	    if (typeof _host[prop] !== 'object' || _host[prop] === null) {
	      _host[prop] = {}
	      observe(_host, prop)
	      // _host._deps.push(function(value) {
	      //   _host[prop] = value[prop]
	      // })
	    }
	    _host = _host[prop]
	  })
	  _host[prop] || (_host[prop] = undefined)
	  observe(_host, prop)
	  scope._watchers[exp] = {
	    host: _host,
	    prop: prop
	  }
	}

	watch.get = function(exp, scope) {
	  var computer = this.computed[exp]
	  if (computer) return computer.value

	  var target = scope._watchers[exp]
	  return target.host[target.prop]
	}

	watch.set = function(exp, value, scope) {
	  var target = scope._watchers[exp]
	  target.host[target.prop] = value
	}

	watch.addDeps = function(exp, fn, scope) {
	  var computer = this.computed[exp]
	  if (computer) {
	    this.computed._deps[exp].push(fn)
	    return
	  }

	  var target = scope._watchers[exp]
	  target.host._deps[target.prop].push(fn)
	}

	module.exports = watch

/***/ },
/* 7 */
/***/ function(module, exports) {

	function bind(obj, k) {
	  var _value = obj[k]
	  Object.defineProperty(obj, k, {
	    get: function() {
	      if (!this._deps) {
	        Object.defineProperty(this, '_deps', {
	          value: {}
	        })
	      }
	      if (!this._deps[k]) {
	        this._deps[k] = []
	      }
	      if (observe._computerSetter) {
	        this._deps[k].push(observe._computerSetter)
	      }
	      return _value
	    },
	    set: function(value) {
	      _value = value
	      if (this._deps[k].length) {
	        this._deps[k].forEach(function(fn) {
	          fn(value)
	        })
	      }
	    }
	  })
	}

	function observe(obj, k) {
	  
	  if (typeof obj !== 'object' || obj === null) return

	  k ? bind(obj, k) : Object.keys(obj).forEach(function(k) {
	    
	    bind(obj, k)
	    observe(obj[k])
	  })
	}

	module.exports = observe

/***/ }
/******/ ]);