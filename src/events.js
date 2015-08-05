var $ = require('jquery')
/**
 * @module events
 * @description 监听自身自定义事件
 */


/**
 * @name on
 * @kind method
 * @description 监听自身自定义事件，如果不指定context参数，调用者即handle的this对象
 * ```js
 * var a = 1
 *   var b = 2
 * ```
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