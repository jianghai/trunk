(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["Trunk"] = factory(require("jquery"));
	else
		root["Trunk"] = factory(root["jquery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
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

	var $ = __webpack_require__(1)
	var _ = __webpack_require__(2)
	var Model = __webpack_require__(3)
	var Collection = __webpack_require__(6)
	var extend = __webpack_require__(7)
	var events = __webpack_require__(4)
	var template = __webpack_require__(8)


	/**
	 * 视图类，提供基础的视图操作，直接处理和反馈用户的操作
	 * ```js
	 * var view = new Trunk({
	 *   el: 'body'
	 * })
	 * ```
	 * @module
	 * @constructor
	 * @param {Object} [attributes] 实例属性
	 */
	function Trunk(attributes) {

	  /**
	   * 当前视图的模型属性或模型
	   * ```js
	   * // 实例化后app.model变成Model类的一个实例
	   * var app = new Trunk({
	   *   model: {
	   *     init: function() {}
	   *   }
	   * })
	   * // 本身就是模型的实例
	   * var app = new Trunk({
	   *   model: new Trunk.Model({
	   *     init: function() {}
	   *   })
	   * })
	   * ```
	   * @name model
	   * @type {Object|Model}
	   */
	  if (!(this.model instanceof Model)) {
	    
	    this.model = new(this.constructor.Model || Model)(this.model)
	  }
	  
	  this.model.view = this
	  this.model.collection && (this.collection = this.model.collection)

	  if (attributes) {
	    if (attributes.className && this.className) {
	      attributes.className = this.className + ' ' + attributes.className
	    }
	    _.mergeAttributes.call(this, attributes)
	  }
	  
	  if (this.el) {
	    /**
	     * 视图的DOM容器，支持jQuery对象或选择器
	     * @name el
	     * @type {jQuery|String}
	     */
	    this.el instanceof $ || (this.el = $(this.el))
	  } else if (this.tag) {
	    /**
	     * 视图的DOM容器HTML标签名称，实例化后会创建对应的jQuery对象
	     * @name tag
	     * @type {String}
	     */
	    this.el = $('<' + this.tag + '>')
	  }

	  /**
	   * 容器的className
	   * @name className
	   * @type {String}
	   */
	  this.className && this.el.addClass(this.className)
	  
	  this.delegateEvents()

	  // 初始化模版
	  this._setTemplate()

	  /**
	   * 构造函数执行完毕前的接口，继承时不会覆盖父类的操作，定义Trunk.prototype.init则对所有view有效
	   * ```js
	   * var view = new Trunk({
	   *   init: function() {
	   *     this.model.fetch()
	   *   }
	   * })
	   * ```
	   * @name init
	   */
	  this.init && this.init()
	}

	$.extend(Trunk.prototype, events, {

	  /**
	   * 在当前view容器下查询子元素，与this.el.find等效
	   * @name $
	   * @param {String} selector 选择器
	   * @return {jQuery} jQuery DOM
	   */
	  $: function(selector) {
	    return this.el.find(selector)
	  },

	  /**
	   * 渲染模版，注入到容器中，model的reset事件触发后自动渲染，手动渲染前确保数据已经准备好
	   * @name render
	   * @return {jQuery} this.el
	   */
	  render: function() {
	    this.trigger('render:before')
	    this.renderer()
	    this.trigger('render:after')
	    return this.el
	  },

	  /**
	   * 渲染核心处理方式，默认为模版渲染，如果采用其他非模版的方式（d3等），则需要重写
	   * ```js
	   * var view = new Trunk({
	   *   renderer: function() {
	   *     d3.select(this.el[0]).append('svg')
	   *   }
	   * })
	   * ```
	   * @name renderer
	   */
	  renderer: function() {
	    /**
	     * 模版选择器，如果不是ID选择器，则从当前容器中查找（确保容器存在于DOM中）
	     * ```js
	     * var list = new Trunk({
	     *   el: '#list', // DOM中已存在
	     *   template: '.template-list' // 从list元素中查找
	     * })
	     * ```
	     * ID选择器则从整个DOM中查找，容器是否存在不受影响
	     * ```js
	     * var Item = Trunk.extend({
	     *   tag: 'li', // 创建的元素，DOM中不存在
	     *   template: '#template-item'
	     * })
	     * ```
	     * @name template
	     * @type {String}
	     */
	    this.template && this.el.html(this.template(this.model.data))
	  },

	  /**
	   * 设置view容器，一般用于实例化的时候容器不存在DOM中，等容器存在后再绑定到view
	   * @param {jQuery} el 容器DOM对象
	   * @name setElement
	   */
	  setElement: function(el) {
	    this.el = el
	    this.delegateEvents()
	  },

	  /**
	   * 删除视图以及model
	   * @name remove
	   */
	  remove: function() {
	    this.el.remove()
	    this.model.remove()
	  },

	  /**
	   * 获取并绑定模版，实例化时读取template属性自动实现
	   * @private
	   * @name setTemplate
	   */
	  _setTemplate: function() {

	    var _template

	    if (!this.template || typeof this.template !== 'string') return

	    _template = this.template.charCodeAt(0) === 35 ? $(this.template) : this.$(this.template)
	    _template = template(_template.html())

	    if (!template) throw '"' + this.template + '" not exist'
	    
	    if (this.hasOwnProperty('template')) {
	      this.template = _template
	    } else {
	      // Todo: template不一定是父类的
	      this.constructor.prototype.template = _template
	    }
	  },

	  /**
	   * 绑定事件（this.events）到当前容器，采用事件委托方式
	   * @name delegateEvents
	   */
	  delegateEvents: function() {

	    /**
	     * DOM事件map，用法：'name selector': 'handle'，未指定el或tag属性则不会绑定事件
	     * ```js
	     * var view = new Trunk({
	     *   events: {
	     *     'click': 'onClick',
	     *     'change select': 'onSelectChange'
	     *   },
	     *   onClick: function() {},
	     *   onSelectChange: function() {}
	     * })
	     * ```
	     * @name events
	     * @type {Object}
	     */
	    if (!this.events) return
	    
	    // 绑定前先解除所有事件，避免绑定多次
	    this.el.off('.trunk_delegateEvents')
	    
	    for (var k in this.events) {
	      var event = this.events[k]
	      if (!this[event]) throw 'Event handle "' + event + '" not existed'
	      k = k.split(' ')
	      var args = [k.shift()]
	      args.push(k.join(' '))
	      this.el.on(args[0] + '.trunk_delegateEvents', args[1], this[event].bind(this))
	    }
	  }
	})


	Trunk.Model = Model
	Trunk.Collection = Collection
	Trunk.template = template

	Trunk.extend = Trunk.Model.extend = Trunk.Collection.extend = extend

	module.exports = Trunk

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)


	/**
	 * 公用函数
	 * @private
	 * @module
	 */


	/**
	 * 是否为纯对象
	 * @param {*} obj
	 * @return {Boolean}
	 */
	var isPlainObject = function(obj) {
	  return obj.constructor === Object
	}
	exports.isPlainObject = isPlainObject

	/**
	 * 是否为数组
	 * @param {*} arr
	 * @return {Boolean}
	 */
	var isArray = function(arr) {
	  return Object.prototype.toString.call(arr) === '[object Array]'
	}
	exports.isArray = isArray

	/**
	 * 是否为函数
	 * @param {*} fun
	 * @return {Boolean}
	 */
	var isFunction = function(fun) {
	  return typeof fun === 'function'
	}
	exports.isFunction = isFunction

	/**
	 * 合并属性，纯对象或数组执行深拷贝，init方法不会被重写
	 * @param {Object} attributes
	 */
	exports.mergeAttributes = function(attributes) {

	  if (isFunction(attributes.init) && isFunction(this.init)) {
	    var _this = this.init
	    var _init = attributes.init
	    attributes.init = function() {
	      _this.call(this)
	      _init.call(this)
	    }
	  }

	  for (var k in attributes) {
	    if (isPlainObject(attributes[k]) || isArray(attributes[k])) {
	      this[k] = $.extend(true, {}, this[k], attributes[k])
	    } else {
	      this[k] = attributes[k]
	    }
	  }
	}

	/**
	 * 判断对象是否改变
	 * @name isEqual
	 * @param {*} a
	 * @param {*} b
	 * @return {Boolean}
	 */
	var isEqual = function(a, b) {
	  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
	    if (a !== b) return false
	  } else {
	    if (Object.keys(a).length != Object.keys(b).length) return false
	    if (Array.isArray(a)) {
	      for (var i = 0; i < a.length; i++) {
	        if (!this.isEqual(a[i], b[i])) return false
	      }
	    } else {
	      for (var k in a) {
	        if (!this.isEqual(a[k], b[k])) return false
	      }
	    }
	  }
	  return true
	}

	exports.isEqual = isEqual

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)
	var _ = __webpack_require__(2)
	var events = __webpack_require__(4)
	var ajax = __webpack_require__(5)


	/**
	 * 模型类，主要进行数据处理，创建view时会自动创建model
	 * ```js
	 * var model = new Trunk.Model({
	 *   url: 'test.json'
	 * })
	 * var view = new Trunk({
	 *   model: model
	 * })
	 * // 推荐方式
	 * var view = new Trunk({
	 *   model: {
	 *     url: 'test.json'
	 *   }
	 * })
	 * ```
	 * @namespace Trunk
	 * @module
	 * @constructor
	 * @param {Object} [attributes] 实例属性
	 */
	function Model(attributes) {

	  if (attributes) _.mergeAttributes.call(this, attributes)

	  /**
	   * 构造函数执行完毕前的接口，继承时不会覆盖父类的操作，定义Trunk.Model.prototype.init则对所有model有效
	   * @name init
	   */
	  this.init && this.init()
	}

	$.extend(Model.prototype, events, ajax, {

	  /**
	   * ajax加载成功后的操作，默认执行parse，再执行reset渲染视图
	   * @private
	   * @param {Object|Array} res 服务器返回的json
	   */
	  _onFetch: function(res) {
	    this.reset(this.parse === Model.prototype.parse ? res : this.parse(res))
	  },

	  /**
	   * 数据到模版的转换，重写parse即可定义自己的转换逻辑
	   * ```markup
	   * <div id="demo">
	   *   <script type="text">
	   *     <# data.stores.forEach(function(store) { #>
	   *       <div><#- store.name  #></div>
	   *     <# }) #>
	   *   </script>
	   * </div>
	   * ```
	   * ```js
	   * var demo = new Trunk({
	   *   model: {
	   *     parse: function(data) {
	   *       return {
	   *         stores: data
	   *       }
	   *     }
	   *   },
	   *   el: '#demo',
	   *   template: 'script'
	   * })
	   * demo.model.reset([{name: '1'}, {name: '2'}])
	   * ```
	   * @name parse
	   * @param {Object|Array} data 传入reset的数据
	   */
	  parse: function() {},

	  /**
	   * 设置模型数据
	   * ```js
	   * // 单个
	   * model.set('country', 'China')
	   * // 多个
	   * model.set({
	   *   country: 'China'
	   *   // ...
	   * })
	   * // 配置
	   * model.set({
	   *   country: 'China'
	   * }, {
	   *   safe: true, // 安全模式，存在validata方法但不进行数据验证（数据验证需要手动定义validate方法，返回布尔值）
	   *   silent: true // 静默模式，不触发change事件
	   * })
	   * ```
	   * @name set
	   * @param {Object|String} data|key 数据json或数据字段名
	   * @param {Object|*} [options]|value 配置项（safe/silent）或数据字段值
	   * @param {Object} [options]
	   * @return {Boolean} 默认返回true，如果存在validate且验证不通过，则返回false
	   */
	  set: function(data, options) {

	    if (typeof data === 'string') {
	      var _data = data
	      data = {}
	      data[_data] = options
	      options = arguments[2]
	    }

	    options || (options = {})

	    // 数据验证，不通过则不会设置数据
	    if (this.validate && !options.safe) {
	      this.trigger('validate', data)
	      if (!this.validate(data)) {
	        this.trigger('invalid')
	        return false
	      }
	    }

	    // 数据变化判断，变化则触发change事件
	    if (!options.silent) {
	      for (var k in data) {
	        if (!_.isEqual(data[k], this.data[k])) {
	          this.data[k] = data[k]
	          this.trigger('change:' + k, data[k])
	        }
	      }
	      this.trigger('change', data)
	      this.collection && this.collection.trigger('change')
	    } else {
	      $.extend(this.data, data)
	    }
	    return true
	  },

	  /**
	   * 重置数据，触发reset事件并渲染视图
	   * @name reset
	   * @param {Object|Array} [data]
	   */
	  reset: function(data) {
	    this.data = data
	    this.trigger('reset', data)
	    this.collection && this.collection.trigger('change')
	    this.view.render()
	  },

	  /**
	   * 删除模型并从集合中去除
	   * @name remove
	   */
	  remove: function() {
	    this.collection && this.collection.remove(this)
	    this.data = null
	  },

	  /**
	   * 在当前模型后追加一个模型
	   * @name after
	   * @param {Object|Array} [data] 新模型的数据
	   */
	  after: function(data) {
	    var model = new this.constructor({
	      data: data
	    })
	    model.collection = this.collection
	    this.collection.list.splice(this.index() + 1, 0, model)
	    this.collection.trigger('add', model)
	    this.collection.trigger('change')
	  },

	  /**
	   * 获取当前模型在集合中的索引
	   * @name index
	   * @return {Number} 索引值
	   */
	  index: function() {
	    return this.collection.list.indexOf(this)
	  },

	  /**
	   * 获取当前模型的前一个模型
	   * @name prev
	   * @return {Model}
	   */
	  prev: function() {
	    return this.collection.list[this.index() - 1]
	  },

	  /**
	   * 获取当前模型的后一个模型
	   * @name next
	   * @return {Model}
	   */
	  next: function() {
	    return this.collection.list[this.index() + 1]
	  }
	})

	module.exports = Model

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)


	/**
	 * 事件模型，提供事件注册和触发的观察机制，Trunk、Trunk.Model、Trunk.Collection的实例均可调用
	 * @module
	 * @type {[type]}
	 */


	/**
	 * 监听自身自定义事件，如果不指定context参数，调用者即handle的this对象
	 * ```js
	 * model.on('save', function() {
	 *   // this.do...
	 * })
	 * ```
	 * @name on
	 * @param {String} name 事件名称
	 * @param {Function} handle 事件回调
	 * @param {*} [context] handle的this对象
	 * @return {Object} 调用者
	 */
	exports.on = function(name, handle, context) {
	  this._events || (this._events = {})
	  ;(this._events[name] || (this._events[name] = [])).push({
	    handle: handle,
	    context: context || this
	  })
	  return this
	}

	/**
	 * 与on不同的是事件生命周期只有一次
	 * @name once
	 */
	exports.once = function(name, handle, context) {
	  var self = this
	  var once = function() {
	    handle.apply(this, arguments)
	    self.off(name, once)
	  }
	  return this.on(name, once, context)
	}

	/**
	 * 解除事件，也可解除指定的事件
	 * ```js
	 * // 解除所有事件
	 * model.off()
	 * ```
	 * @name off
	 * @param {String} [name] 事件名称
	 * @param {Function} [handle] 事件回调
	 * @return {Object} 调用者
	 */
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

	/**
	 * 与on不同的是监听其他对象
	 * ```js
	 * view1.listen(model2, 'save', function() {
	 *   // this.do...
	 * })
	 * ```
	 * @name listen
	 */
	exports.listen = function(obj, name, handle) {
	  obj.on(name, handle, this)
	  return this
	}

	/**
	 * 与once不同的是监听其他对象
	 * @name listenOnce
	 */
	exports.listenOnce = function(obj, name, handle) {
	  obj.once(name, handle, this)
	  return this
	}

	/**
	 * 触发事件
	 * ```js
	 * view1.listen(view2, 'click', function(id) {
	 *   // id: 99
	 * })
	 * view2.trigger('click', 99)
	 * ```
	 * @name trigger
	 * @param {String} name 事件名称
	 * @param {*...} [parameter...] 事件回调接收的参数
	 * @return {Object} 调用者
	 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)


	/**
	 * ajax请求交互模块，服务端返回的数据格式必须是JSON，
	 * Trunk、Trunk.Model、Trunk.Collection的实例均可调用
	 * @module
	 */


	/**
	 * 设置GET请求参数，如果参数值为空字符串或null或undefined，则删除当前参数
	 * ```js
	 * model.setParam({
	 *   sort: 'id',
	 *   sortType: null // 删除当前字段
	 * })
	 * ```
	 * @name setParam
	 * @param {Object|String} param|key 请求参数对象或参数名
	 * @param {Boolean|*} [silent]|value 静默模式（默认设置完参数后fetch数据）或参数值
	 * @param {Boolean} [silent]
	 */
	exports.setParam = function(param, silent) {

	  /**
	   * fetch数据的请求参数对象
	   * @name param
	   * @type {Object}
	   */
	  this.param || (this.param = {})

	  if (typeof param === 'string') {
	    var _key = param
	    param = {}
	    param[_key] = silent
	    silent = arguments[2]
	  }

	  for (var k in param) {
	    var val = param[k]
	    if (val || val === 0) {
	      this.param[k] = val
	    } else {
	      delete this.param[k]
	    }
	  }

	  !silent && this.fetch()
	}

	/**
	 * 发送ajax请求，向服务器fetch数据（GET请求）
	 * @name fetch
	 */
	exports.fetch = function() {
	  var self = this
	  this.trigger('request')
	  $.ajax({

	    /**
	     * fetch数据的URL
	     * @name url
	     * @type {String}
	     */
	    url: this.url,
	    data: this.param
	  }).done(function(res) {
	    self.trigger('sync', res)
	    self._onFetch(res)
	  })
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)
	var Model = __webpack_require__(3)
	var events = __webpack_require__(4)
	var ajax = __webpack_require__(5)
	var _ = __webpack_require__(2)


	/**
	 * 模型集合
	 * ```js
	 * var collection = new Trunk.Collection({
	 *   // 集合的模型，默认为Trunk.Model
	 *   Model: Trunk.Model.extend({
	 *     prop: 1
	 *   })
	 * })
	 * ```
	 * @namespace Trunk
	 * @module
	 * @constructor
	 * @param {Object} [attributes] 实例属性
	 */
	function Collection(attributes) {

	  if (attributes) _.mergeAttributes.call(this, attributes)

	  /**
	   * 模型集合数组
	   * @name list
	   * @type {Array}
	   */
	  this.list = []

	  /**
	   * 构造函数执行完毕前的接口，继承时不会覆盖父类的操作，定义Trunk.Collection.prototype.init则对所有collection有效
	   * @name init
	   */
	  this.init && this.init()
	}

	$.extend(Collection.prototype, events, ajax, {

	  /**
	   * ajax加载成功后的操作，默认清空list，执行parse，再遍历数据添加到集合中
	   * @private
	   * @param {Object|Array} res 服务器返回的json
	   */
	  _onFetch: function(res) {
	    this.remove()
	    this.add(this.parse === Collection.prototype.parse ? res : this.parse(res))
	  },

	  /**
	   * fetch后的数据到add前的转换，重写parse即可定义自己的转换逻辑
	   * ```js
	   * var collection = new Trunk.Collection({
	   *   url: 'test.json' // {stores: [{id: 1}, {id: 2}, {id: 3}]}
	   *   parse: function(data) {
	   *     return data.stores
	   *   }
	   * })
	   * ```
	   * @name parse
	   * @param {Object|Array} data 集合fetch后的数据
	   */
	  parse: function() {},

	  /**
	   * 获取集合模型的数量
	   * @name length
	   * @return {Number}
	   */
	  length: function() {
	    return this.list.length
	  },

	  /**
	   * 往集合中添加数据，如果是数组则添加多条，每条数据创建一个模型，所以单条数据类型必须为Object，
	   * 否则当成数组遍历成多个模型
	   * @name add
	   * @param {Array|Object} data
	   */
	  add: function(data) {
	    if (_.isArray(data)) {
	      data.forEach(function(item) {
	        this._addOne(item)
	      }, this)
	    } else {
	      this._addOne(data)
	    }
	    this.trigger('change')
	  },

	  /**
	   * 添加一条数据
	   * @private
	   * @name _addOne
	   * @param {Object} item
	   */
	  _addOne: function(item) {

	    var model = new(this.constructor.Model || Model)({
	      data: item
	    })
	    model.collection = this
	    this.trigger('add', model, this.list.push(model) - 1)
	  },

	  /**
	   * 从集合中删除模型，支持多个模型
	   * @name remove
	   * @param {Model|Array} [model|models]
	   */
	  remove: function(model) {
	    if (model) {
	      if (_.isArray(model)) {
	        model.forEach(function(model) {
	          model.view.el.remove()
	          this.list.splice(model.index(), 1)
	        })
	      } else {
	        model.view.el.remove()
	        this.list.splice(model.index(), 1)
	      }
	    } else {
	      this.list.forEach(function(model) {
	        model.view.el.remove()
	      })
	      this.list.length = 0
	    }
	    this.trigger('change')
	  },

	  /**
	   * 集合转换成数组，各个数组元素即各个模型的data属性值
	   * @name toArray
	   * @return {Array}
	   */
	  toArray: function() {
	    return this.list.map(function(model) {
	      return model.data
	    })
	  }
	})

	module.exports = Collection

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1)
	var _ = __webpack_require__(2)


	/**
	 * 类继承机制
	 * ```js
	 * var List = Trunk.extend({})
	 * List.Model = Trunk.Model.extend({})
	 * var MyList = List.extend({})
	 * MyList.Model = List.Model.extend({})
	 * ```
	 * @module
	 * @param {Object} attributes 扩展属性
	 * @return {Function} 子类，子类可以继续被继承
	 */
	function extend(attributes) {
	  var Super = this
	  var Subclass = function() {
	    Super.apply(this, arguments)
	  }

	  // 继承Model
	  Super.Model && (Subclass.Model = Super.Model)

	  Subclass.extend = extend

	  if (Object.create) {
	    Subclass.prototype = Object.create(Super.prototype)
	  } else {
	    var F = function() {}
	    F.prototype = Super.prototype
	    Subclass.prototype = new F()
	  }
	  Subclass.prototype.constructor = Subclass

	  _.mergeAttributes.call(Subclass.prototype, attributes)

	  return Subclass
	}

	module.exports = extend

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * 基于字符串的模版，转换模版字符串成一个可执行的函数，视图中传入template选择器自动获取、编译
	 * ```js
	 * var template = Trunk.template('<button><#- data.content #></button>')
	 * console.log(template({content: 'click me'})) // <button>click me</button>
	 * ```
	 * 语法：<#- 表达式 #>；<# 语句 #>
	 * @namespace Trunk
	 * @module
	 * @param {String} str 模版字符串
	 * @return {Function} 传入数据即可返回渲染后的字符串
	 */
	function template(str) {
	  if (!str) return
	  str = "var out = '" + str.replace(/\s*\n\s*/g, '') + "'"
	  str = str.replace(getReg.statement(), "';$1;out+='")
	  str = str.replace(getReg.express(), "'+($1)+'")
	  str += ";return out;"
	  return new Function(template.global, str)
	}

	// 规则map
	var regRules = {
	  statement: '\\s([\\s\\S]+?)', // Inertia match
	  express: '-\\s([\\s\\S]+?)'
	}

	var getReg = {}

	for (var i in regRules) {
	  (function(i) {
	    getReg[i] = function() {
	      var _reg = new RegExp(template.leftTag + regRules[i] + template.rightTag, 'g')
	      getReg[i] = function() {
	        return _reg
	      }
	      return _reg
	    }
	  })(i)
	}

	/**
	 * 模版中数据根命名空间，默认'data'，可自定义
	 * @name global
	 * @type {String}
	 */
	template.global = 'data'

	/**
	 * 模版中左分隔符，默认'<#'，可自定义
	 * @name leftTag
	 * @type {String}
	 */
	template.leftTag = '<#'

	/**
	 * 模版中右分隔符，默认'#>'，可自定义
	 * @name rightTag
	 * @type {String}
	 */
	template.rightTag = '#>'

	module.exports = template

/***/ }
/******/ ])
});
;