var $ = require('jquery')


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