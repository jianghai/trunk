var $ = require('jquery')


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
    if (attributes[k] && (isPlainObject(attributes[k]) || isArray(attributes[k]))) {
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