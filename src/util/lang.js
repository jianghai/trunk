/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule lang
 */

'use strict'

/**
 * Array like object to Array, such as arguments、NodeList.
 */
exports.toArray = function(arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0)
}

/**
 * Entend given object with own enumerable properties of anthor object.
 */
exports.merge = function(host, extend) {
  for (var k in extend) {
    extend.hasOwnProperty(k) && (host[k] = extend[k])
  }
}

/**
 * Array like is not Array.
 */
exports.isArray = function(array) {
  return Object.prototype.toString.call(array) === '[object Array]'
}

/**
 * null is not object.
 */
exports.isObject = function(obj) {
  return typeof obj === 'object' && obj !== null
}

/**
 * Faster than Function.prototype.bind but no extra arguments.
 */
exports.bind = function(fn, context) {
  return function() {
    return fn.apply(context, arguments)
  }
}

/**
 * As we always got an error can not read property xx of undefined, you can pass multiple 
 * parameters start with third as the property chain.
 */
exports.initialize = function(host, value) {
  var args = arguments
  var len = args.length - 1
  var lastProp = args[len]
  var i = 2
  while (i < len) {
    var prop = args[i++]
    host[prop] || this.defineValue(host, prop, {})
    host = host[prop]
  }
  host[lastProp] || this.defineValue(host, lastProp, value)
  return host[lastProp]
}

/**
 * Set value which was not enumerable.
 */
exports.defineValue = function(host, key, value) {
  Object.defineProperty(host, key, {
    configurable: true,
    writable: true,
    enumerable: false,
    value: value
  })
}

/**
 * Executes a provided function once per experssion of split string like 'x:1,y:2'.
 */
exports.mapParse = function(map, callback, context) {
  map = map.split(',')
  for (var i = map.length; i--; ) {
    var item = map[i].trim().split(':')
    callback.call(context, item[0], item[1].trim())
  }
}