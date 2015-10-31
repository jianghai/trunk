/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule watch
 */

'use strict'

var _ = require('./util')

/**
 * Set getter/setter of expression for efficiency usage.
 */
exports._initializeWatcher = function(exp, scope) {
  var getter, setter
  if (exp.indexOf('.') !== -1 && exp.indexOf('[') !== -1) {
    getter = function() {
      return scope[exp]
    }
    setter = function(value) {
      scope[exp] = value
    }
  } else {
    getter = new Function('scope', 'return scope.' + exp)
    setter = new Function('value', 'scope', 'scope.' + exp + ' = value')
  }
  scope._watchers[exp] = {
    getter: getter,
    setter: setter
  }
}

/**
 * Get the value of expression.
 */
exports.get = function(exp, scope) {
  var value
  try {
    value = scope._watchers[exp].getter(scope)
  } catch (e) {
    value = ''
  }
  return value
}

/**
 * Set the value of expression.
 */
exports.set = function(exp, value, scope) {
  scope._watchers[exp].setter(value, scope)
}

/**
 * Watching a value change manually and do sth.
 */
exports.watch = function(exp, callback) {
  this.addDeps(exp, callback, this)
}