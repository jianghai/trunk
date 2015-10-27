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
  scope._watchers[exp] = {
    getter: new Function('scope', 'return scope.' + exp),
    setter: new Function('value', 'scope', 'scope.' + exp + ' = value')
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
 * Push dependent to the dependents container. If the expression is multi-stage, push the 
 * child dependents to the parent's sub property for a permanent lifecycle.
 */
exports.addDeps = function(exp, callback, scope) {

  scope._watchers[exp] || this._initializeWatcher(exp, scope)

  var getter = scope._watchers[exp].getter
  var host = scope
  var match = exp.match(/[\w_]+/g)
  var handle = {
    scope: scope,
    getter: getter,
    callback: callback
  }

  host._deps || _.defineValue(host, '_deps', {})
  
  var deps = host._deps
  var i = 0
  var len = match.length

  while (i < len) {

    var key = match[i]
    var isLast = i + 1 === len

    deps[key] || (deps[key] = {})
    deps = deps[key]
    deps.handles || (deps.handles = [])
    deps.handles.push(handle)

    if (!isLast) {
      deps.sub || (deps.sub = {})
      deps = deps.sub
    }

    // Push dependents if child exist
    if (host) {
      if (i > 0 && _.isObject(host)) {
        var handles = _.initialize(host, [], '_deps', key, 'handles')
        handles.push(handle)
        isLast || (host._deps[key].sub = deps)
      }
      host = host[key]
    }

    i++
  }
}

/**
 * Watching a value change manually and do sth.
 */
exports.watch = function(exp, callback) {
  this.addDeps(exp, callback, this)
}