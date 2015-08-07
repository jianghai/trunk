var $ = require('jquery')
var _ = require('./util')
var Model = require('./Model')
var Collection = require('./Collection')
var Router = require('./Router')
var extend = require('./extend')
var events = require('./events')
var vjs = require('./vjs')


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
   * 当前view的model
   * @name model
   * @type {Model}
   */
  this.model instanceof Model || (this.model = new(this.constructor.Model || Model)(this.model))
  
  this.model.view = this
  this.model.collection && (this.collection = this.model.collection)

  if (!attributes) return

  if (attributes.className && this.className) {
    attributes.className = this.className + ' ' + attributes.className
  }

  _.mergeAttributes.call(this, attributes)
  
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
  this.setTemplate()

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
   * @name setTemplate
   */
  setTemplate: function() {

    var template

    if (!this.template || typeof this.template !== 'string') return

    template = this.template.charCodeAt(0) === 35 ? $(this.template) : this.$(this.template)
    template = vjs(template.html())

    if (!template) throw '"' + this.template + '" not exist'
    
    if (this.hasOwnProperty('template')) {
      this.template = template
    } else {
      // Todo: template不一定是父类的
      this.constructor.prototype.template = template
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
Trunk.Router = Router

Trunk.extend = Trunk.Model.extend = Trunk.Collection.extend = Trunk.Router.extend = extend

module.exports = Trunk