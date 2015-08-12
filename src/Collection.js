var $ = require('jquery')
var Model = require('./Model')
var events = require('./events')
var ajax = require('./ajax')
var _ = require('./util')


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