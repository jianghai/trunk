/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule observe
 */

'use strict'

var _            = require('./util')
var ObserveArray = require('./class/ObserveArray')

var Helper = {

  /**
   * Special handling for Array for some CRUD.
   */
  observeArray: function(host, key, context) {
    var array = host[key]
    var isArray = _.isArray(array)
    if (isArray) {
      new ObserveArray(host, key, context)
      for (var i = array.length; i--;) {
        _.isObject(array[i]) && context.observe(array[i])
      }
    }
    return isArray
  },

  /**
   * If the value of setter is object.
   */
  excuteValue: function(host, key, value, context) {

    if (!_.isObject(value)) return

    this.observeArray(host, key, context) || context.observe(value)
    var sub = host._deps && host._deps[key] && host._deps[key].sub
    sub && context.setDeps(value, sub)
  },

  /**
   * Define getter/setter for specified property.
   */
  observe: function(obj, key, context) {
    var self = this
    var _value = obj[key]
    Object.defineProperty(obj, key, {
      get: function() {
        context.addComputs(this, key)
        return _value
      },
      set: function(value) {
        // Todo: toggle
        if (value === _value) return
        _value = value
        self.excuteValue(this, key, value, context)
        context.traverseDeps(this, key)
        context.traverseComputs(this, key)
      }
    })
  }
}

/**
 * Define getter/setter for all enumerable properties to record computed handles and invokes 
 * dependents & computed dependents, redefine when the value of setter is object.
 */
module.exports = function(obj) {
  for (var keys = Object.keys(obj), i = keys.length; i--;) {
    var key = keys[i]
    Helper.observe(obj, key, this)
    var _value = obj[key]
    if (!Helper.observeArray(obj, key, this)) {
      _.isObject(_value) && this.observe(_value)
    }
  }
}