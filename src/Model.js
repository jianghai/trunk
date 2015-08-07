var $ = require('jquery')
var _ = require('./util')
var events = require('./events')
var ajax = require('./ajax')


/**
 * 模型类，主要进行数据处理，创建view时会自动创建model
 * ```js
 * var view = new Trunk({
 *   model: {
 *     url: 'test.json'
 *   },
 *   el: 'body'
 * })
 * ```
 * 相当于
 * ```js
 * var view = new Trunk({
 *   el: 'body'
 * })
 * var model = new Trunk.Model({
 *   url: 'test.json'
 * })
 * view.model = model
 * ```
 * @namespace Trunk
 * @module
 * @constructor
 * @param {Object} [attributes] 实例属性
 */
function Model(attributes) {

  if (!attributes) return

  _.mergeAttributes.call(this, attributes)

  /**
   * 模型默认数据，所有新增的数据都在此基础上进行扩展，如果data是数组则忽略defaults
   * @name defaults
   * @type {Object}
   */
  if (this.defaults && this.data instanceof Object) {
    /**
     * 模型数据
     * @name data
     * @type {Object|Array}
     */
    this.data = $.extend(true, {}, this.defaults, this.data)
  }

  /**
   * 构造函数执行完毕前的接口，继承时不会覆盖父类的操作，定义Trunk.Model.prototype.init则对所有model有效
   * @name init
   */
  this.init && this.init()
}

$.extend(Model.prototype, events, ajax, {

  onFetch: function(res) {
    this.reset(typeof this.parse === 'function' && this.parse(res) || res)
  },

  isEqual: function(a, b) {
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
  },

  set: function(data, options) {

    if (typeof data === 'string') {
      var _data = data
      data = {}
      data[_data] = options
      options = arguments[2]
    }

    options || (options = {})

    // Validate if set
    if (this.validate && options.validate !== false) {
      this.trigger('validate', data)
      if (!this.validate(data)) {
        this.trigger('invalid')
        return false
      }
    }

    if (!options.silent) {
      for (var k in data) {
        if (!this.isEqual(data[k], this.data[k])) {
          this.data[k] = data[k]
          this.trigger('change:' + k, data[k])
        }
      }
      this.trigger('change', data)
      this.collection && this.collection.trigger('change')
    }
    return true
  },

  reset: function(data) {
    this.data = $.extend(true, data.constructor === Object, this.defaults, data)
    // this.trigger('change', data)
    this.trigger('reset', data)
    this.collection && this.collection.trigger('change')
    this.view.render()
  },

  remove: function() {
    this.collection && this.collection.reduce(this)
    this.data = this.defaults || (data.constructor === Object ? {} : [])
  },

  // Insert a model after this to this.collection
  after: function(data) {
    var model = new this.constructor({
      data: data
    })
    model.collection = this.collection
    this.collection.list.splice(this.index() + 1, 0, model)
    this.collection.trigger('add', model)
    this.collection.trigger('change')
  },

  // Get index of this.collection
  index: function() {
    return this.collection.list.indexOf(this)
  },

  // Get the model before this
  prev: function() {
    return this.collection.list[this.index() - 1]
  },

  // Get the model after this
  next: function() {
    return this.collection.list[this.index() + 1]
  }
})

module.exports = Model