var $ = require('jquery')
var _ = require('./util')
var events = require('./events')
var ajax = require('./ajax')


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

  /**
   * ajax加载成功后的操作，默认执行parse，再执行reset渲染视图
   * @private
   * @param {Object|Array} res 服务器返回的json
   */
  _onFetch: function(res) {
    this.reset(this.parse === Model.prototype.parse ? res || this.parse(res))
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
   * 重置数据（扩展this.defaults），触发reset事件并渲染视图
   * @name reset
   * @param {Object|Array} [data]
   */
  reset: function(data) {
    this.data = $.extend(true, _.isArray(data) ? [] : {}, this.defaults, data)
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
    this.data = this.defaults || (_.isArray(data) ? [] : {})
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