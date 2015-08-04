(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Trunk"] = factory();
	else
		root["Trunk"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

	var Model = __webpack_require__(1)
	var View = __webpack_require__(4)
	var Collection = __webpack_require__(6)
	var Router = __webpack_require__(7)
	var extend = __webpack_require__(8)


	var Trunk = {}

	Trunk.Model = Model
	Trunk.Collection = Collection
	Trunk.View = View
	Trunk.Router = Router

	Trunk.Model.extend = Trunk.Collection.extend = Trunk.View.extend = Trunk.Router.extend = extend

	module.exports = Trunk

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var events = __webpack_require__(2)
	var ajax = __webpack_require__(3)

	function Model(prop) {

	  if (prop) {
	    for (var k in prop) {
	      if (k === 'param') {
	        this[k] = $.extend(true, {}, this[k], prop[k]);
	      } else {
	        this[k] = prop[k];
	      }
	    }
	  }

	  this.data = $.extend(true, {}, this.defaults, this.data);

	  this.trigger('create');

	  this.init && this.init();
	}

	$.extend(Model.prototype, events, ajax, {

	  onFetch: function(res) {
	    this.reset(typeof this.parse === 'function' && this.parse(res) || res);
	  },

	  isEqual: function(a, b) {
	    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
	      if (a !== b) return false;
	    } else {
	      if (Object.keys(a).length != Object.keys(b).length) return false;
	      if (Array.isArray(a)) {
	        for (var i = 0; i < a.length; i++) {
	          if (!this.isEqual(a[i], b[i])) return false;
	        }
	      } else {
	        for (var k in a) {
	          if (!this.isEqual(a[k], b[k])) return false;
	        }
	      }
	    }
	    return true;
	  },

	  set: function(data, options) {

	    if (typeof data === 'string') {
	      var _data = data;
	      data = {};
	      data[_data] = options;
	      options = arguments[2]
	    }

	    options || (options = {});

	    // Validate if set
	    if (this.validate && options.validate !== false) {
	      this.trigger('validate', data);
	      if (!this.validate(data)) {
	        this.trigger('invalid');
	        return false;
	      }
	    }

	    if (!options.silent) {
	      for (var k in data) {
	        if (!this.isEqual(data[k], this.data[k])) {
	          this.data[k] = data[k];
	          this.trigger('change:' + k, data[k]);
	        }
	      }
	      this.trigger('change', data);
	      this.collection && this.collection.trigger('change');
	    }
	    return true;
	  },

	  reset: function(data) {
	    this.data = $.extend({}, this.defaults, data);
	    // this.trigger('change', data);
	    this.trigger('reset', data);
	    this.collection && this.collection.trigger('change');
	  },

	  remove: function() {
	    this.collection && this.collection.reduce(this);
	    this.data = this.defaults || {};
	    this.view.el.remove();
	  },

	  // Insert a model after this to this.collection
	  after: function(data) {
	    var model = new this.constructor({
	      data: data
	    });
	    model.collection = this.collection;
	    this.collection.list.splice(this.index() + 1, 0, model);
	    this.collection.trigger('add', model);
	    this.collection.trigger('change');
	  },

	  // Get index of this.collection
	  index: function() {
	    return this.collection.list.indexOf(this);
	  },

	  // Get the model before this
	  prev: function() {
	    return this.collection.list[this.index() - 1];
	  },

	  // Get the model after this
	  next: function() {
	    return this.collection.list[this.index() + 1];
	  }
	})

	module.exports = Model

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * @module events
	 * @description 监听自身自定义事件
	 */


	/**
	 * @name on
	 * @kind method
	 * 
	 * @description 监听自身自定义事件，如果不指定context参数，调用者即handle的this对象
	 * ```js
	 * var a = 1
	 *   var b = 2
	 * ```
	 * 
	 * @param {String} name 自定义事件名称
	 * @param {Function} handle 事件触发后回调
	 * @param {[Object]} context handle的this对象
	 * @return {Object} 调用者
	 */
	exports.on = function(name, handle, context) {
	  this._events || (this._events = {});
	  (this._events[name] || (this._events[name] = [])).push({
	    handle: handle,
	    context: context || this
	  })
	  return this
	}

	/**
	 * 监听自身自定义事件，如果不指定context参数，调用者即handle的this对象
	 * 
	 * @param {String} name 自定义事件名称
	 * @param {Function} handle 事件触发后回调
	 * @param {[Object]} context handle的this对象
	 * @return {Object} 调用者
	 */
	exports.once = function(name, handle, context) {
	  var self = this
	  var once = function() {
	    handle.apply(this, arguments)
	    self.off(name, once)
	  }
	  return this.on(name, once, context)
	}

	exports.off = function(name, handle) {
	  if (!this._events) return this
	  name || (this._events = {})
	  handle || (this._events[name] = [])
	  var events = this._events[name]
	  if (!events.length) return this
	  var remaining = []
	  for (var i = 0, len = events.length; i < len; i++) {
	    events[i].handle !== handle && remaining.push(events[i])
	  }
	  this._events[name] = remaining
	  return this
	}

	exports.listen = function(obj, name, handle) {
	  obj.on(name, handle, this)
	  return this
	}

	exports.listenOnce = function(obj, name, handle) {
	  obj.once(name, handle, this)
	  return this
	}

	exports.trigger = function(name) {
	  if (!this._events || !this._events[name]) return this
	  var self = this
	  var param = [].slice.call(arguments, 1)
	  var events = this._events[name]
	  for (var i = 0, len = events.length; i < len; i++) {
	    events[i].handle.apply(events[i].context, param)
	  }
	  return this
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.setParam = function(param, silent) {

	  this.param || (this.param = {});

	  if (typeof param === 'string') {
	    var _key = param;
	    param = {};
	    param[_key] = silent;
	    silent = arguments[2];
	  }

	  for (var k in param) {
	    var val = param[k];
	    if (val || val === 0) {
	      this.param[k] = val;
	    } else {
	      delete this.param[k];
	    }
	  }

	  !silent && this.fetch();
	}

	exports.onDone = function(res) {
	  this.trigger('sync', res);
	  this.onFetch(res);
	}

	exports.fetch = function() {
	  var self = this;
	  this.trigger('request');
	  $.ajax({
	    url: this.url,
	    data: this.param
	  }).done(this.onDone.bind(this));
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Model = __webpack_require__(1)
	var events = __webpack_require__(2)
	var vjs = __webpack_require__(5)

	/**
	 * @constructor
	 * @param {[type]} prop [description]
	 */
	function View(prop) {

	  if (arguments.length > 1) {
	    var _init_0 = prop.init;
	    for (var i = 1; i < arguments.length; i++) {
	      var _prop = arguments[i];
	      var _init = _prop.init;
	      if (_init) {
	        _prop.init = function() {
	          _init_0 && _init_0.call(this);
	          _init.call(this);
	        }
	      }
	      $.extend(true, prop, _prop);
	    }
	  }

	  if (prop) {

	    if (typeof prop.init === 'function' && typeof this.init === 'function') {
	      var _this = this.init;
	      var _init = prop.init;
	      prop.init = function() {
	        _this.call(this);
	        _init.call(this);
	      };
	    }

	    if (prop.className && this.className) {
	      prop.className = this.className + ' ' + prop.className;
	    }

	    for (var k in prop) {
	      if (k === 'events') {
	        this[k] = $.extend(true, {}, this[k], prop[k]);
	      } else {
	        this[k] = prop[k];
	      }
	    }

	  }

	  this.model instanceof Model || (this.model = new(this.Model || Model)(this.model));

	  this.model.view = this;

	  this.model.collection && (this.collection = this.model.collection);

	  // Events
	  this.listen(this.model, 'reset', this.render);

	  this.tag && (this.el = $('<' + this.tag + '>'));
	  typeof this.el === 'string' && this.el.indexOf('#') === 0 && (this.el = $(this.el));
	  typeof this.template === 'string' && this.template.indexOf('#') === 0 && this.getTemplate();

	  if (typeof this.el === 'object') {
	    this.delegateEvents();
	    !this.tag && typeof this.template === 'string' && this.getTemplate();
	    this.className && this.el.addClass(this.className);
	  }

	  this.init && this.init()
	}

	$.extend(View.prototype, events, {

	  /**
	   * 在当前 view 容器下查询子元素，与 this.el.find 等效
	   * @param  {string} selector 子元素选择器
	   * @return {object}          子元素 jQuery 对象
	   */
	  $: function(selector) {
	    return this.el.find(selector);
	  },

	  render: function() {
	    this.trigger('render:before');
	    this.template && this.el.html(this.template(this.model.data));
	    this.trigger('render:after');
	    return this.el;
	  },

	  setElement: function(el) {
	    this.el = el;
	    this.delegateEvents();
	  },

	  remove: function() {
	    this.model.remove();
	  },

	  getTemplate: function() {
	    var template = vjs((
	      this.template.indexOf('.') === 0 ? this.$(this.template) : $(this.template)).html());
	    if (!template) throw '"' + this.template + '" not exist';
	    if (this.hasOwnProperty('template')) {
	      this.template = template;
	    } else {
	      delete this.template;
	      this.constructor.prototype.template = template;
	    }
	  },

	  // Bind events using events delegation, this methdo was opened because sometimes the
	  // subView events need to be rebind manual because jQuery html will clean the events if
	  // the parentView use html to add a childView.
	  delegateEvents: function() {
	    // events is a collection of dom events of the view
	    if (!this.events) return;
	    // Remove events avoid repeat events
	    this.el.off('.trunk_delegateEvents');
	    for (var k in this.events) {
	      var event = this.events[k];
	      if (!this[event]) throw 'Event handle "' + event + '" not existed';
	      k = k.split(' ');
	      var args = [k.shift()];
	      args.push(k.join(' '));
	      this.el.on(args[0] + '.trunk_delegateEvents', args[1], this[event].bind(this));
	    }
	  }
	})

	module.exports = View

/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Convert template string to javascript code, return a function which
	 * has a parameter data and return html string.
	 */
	function vjs(str) {
	  if (!str) return;
	  str = "var out = '" + str.replace(/\s*\n\s*/g, '') + "'";
	  str = str.replace(getReg.statement(), "';$1out+='");
	  str = str.replace(getReg.express(), "'+($1)+'");
	  str += ";return out;";
	  return new Function(vjs.global, str);
	};

	var regRules = {
	  statement: '\\s([\\s\\S]+?)', // Inertia match
	  express: '-\\s([\\s\\S]+?)'
	};

	var getReg = {};

	for (var i in regRules) {
	  (function(i) {
	    getReg[i] = function() {
	      var _reg = new RegExp(vjs.leftTag + regRules[i] + vjs.rightTag, 'g');
	      getReg[i] = function() {
	        return _reg;
	      }
	      return _reg;
	    }
	  })(i);
	}

	/**
	 * Global variable name in template
	 */
	vjs.global = 'data'


	vjs.leftTag = '<#'
	vjs.rightTag = '#>'

	module.exports = vjs

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Model = __webpack_require__(1)
	var events = __webpack_require__(2)
	var ajax = __webpack_require__(3)

	function Collection(prop) {
	  if (prop) {
	    for (var i in prop) {
	      this[i] = prop[i];
	    }
	  }
	  this.list = [];

	  this.init && this.init();
	}

	$.extend(Collection.prototype, events, ajax, {

	  length: function() {
	    return this.list.length;
	  },

	  add: function(data) {
	    if (Array.isArray(data)) {
	      data.forEach(function(item) {
	        this.addOne(item);
	      }, this);
	    } else {
	      this.addOne(data);
	    }
	    this.trigger('change');
	  },

	  addOne: function(item) {
	    var model = new(this.Model || Model)({
	      data: item
	    });
	    model.collection = this;
	    this.trigger('add', model, this.list.push(model) - 1);
	  },

	  reduce: function(model) {
	    this.list.splice(model.index(), 1);
	    this.trigger('reduce', model);
	    this.trigger('change');
	  },

	  toArray: function() {
	    return this.list.map(function(model) {
	      return model.data;
	    });
	  },

	  clear: function(models) {
	    (models || this.list).forEach(function(model) {
	      models && this.list.splice(model.index(), 1);
	      model.view.el.remove();
	    }, this);
	    !models && (this.list.length = 0);
	    this.trigger('reduce');
	    this.trigger('change');
	    return this;
	  }
	})

	module.exports = Collection

/***/ },
/* 7 */
/***/ function(module, exports) {

	function Router(prop) {

	  for (var i in prop) {
	    this[i] = prop[i];
	  }

	  this.init && this.init();

	  // Bind router rules
	  for (var rule in this.router) {
	    var handle = this[this.router[rule]];
	    if (Router.routers) {
	      if (Router.routers[rule]) {
	        Router.routers[rule].push(handle);
	      } else {
	        Router.routers[rule] = [handle];
	      }
	    } else {
	      Router.routers = {};
	      Router.routers[rule] = [handle];
	    }
	    if (/\*|\:/.test(rule)) {
	      if (!Router.regs) {
	        Router.regs = {};
	      }
	      var reg = rule.replace(/:[^\/.]+/g, '(.+)')
	        .replace(/\*/g, '(.*)')
	        .replace(/\//g, '\\\/');
	      reg = '^' + reg + '$';
	      Router.regs[rule] = new RegExp(reg);
	    }
	  }

	  // Listen hash change and trigger handles of router rules 
	  if (!Router.isListen) {

	    var onHash = function() {
	      var hash = location.hash.slice(1).split('?');
	      Trunk.get = null;
	      if (hash[1]) {
	        var param = {};
	        hash[1].split('&').forEach(function(query) {
	          var query = query.split('=');
	          // Don't forget to decode the query string
	          query[1] = decodeURIComponent(query[1]);
	          if (query[0] in param) {
	            if (!Array.isArray(param[query[0]])) {
	              param[query[0]] = [param[query[0]]];
	            }
	            param[query[0]].push(query[1]);
	          } else {
	            param[query[0]] = query[1];
	          }
	        });
	        Trunk.get = param;
	      }
	      hash = hash[0];
	      if (Router.routers[hash]) {
	        // Execute every handle
	        Router.routers[hash].forEach(function(handle) {
	          handle.call(this);
	        }, this);
	      } else {
	        for (var k in Router.regs) {
	          var match, reg = Router.regs[k];
	          if (match = hash.match(reg)) {
	            match.shift();
	            Router.routers[k].forEach(function(handle) {
	              handle.apply(this, match);
	            }, this);
	            return false;
	          }
	        }
	      }
	    };

	    $(win).on('hashchange', onHash);

	    // Default hash handle when dom is ready
	    $(onHash);

	    Router.isListen = true;
	  }
	}

	module.exports = Router

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * Class inherit
	 */
	function extend(prop) {
	  var Super = this;
	  var Subclass = function() {
	    Super.apply(this, arguments);
	  };

	  Subclass.extend = extend;

	  if (Object.create) {
	    Subclass.prototype = Object.create(Super.prototype);
	  } else {
	    var F = function() {}
	    F.prototype = Super.prototype;
	    Subclass.prototype = new F();
	  }
	  Subclass.prototype.constructor = Subclass;

	  if (typeof Subclass.prototype.init === 'function' && typeof prop.init === 'function') {
	    var _sub = Subclass.prototype.init;
	    var _prop = prop.init;
	    prop.init = function() {
	      _sub.call(this);
	      _prop.call(this);
	    }
	  }

	  for (var k in prop) {
	    if (Subclass.prototype[k] && typeof Subclass.prototype[k] === 'object') {
	      Subclass.prototype[k] = $.extend(true, {}, Subclass.prototype[k], prop[k]);
	    } else {
	      Subclass.prototype[k] = prop[k];
	    }
	  }

	  return Subclass;
	}

	module.exports = extend

/***/ }
/******/ ])
});
;