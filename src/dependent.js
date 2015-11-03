/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule dependent
 */

'use strict'

var _ = require('./util')

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
 * Invoke dependents.
 */
exports.traverseDeps = function(host, key) {
  if (!host._deps || !host._deps[key]) return
  var deps = host._deps[key]
  for (var i = deps.handles.length; i--; ) {
    var item = deps.handles[i]
    var value
    try {
      value = item.getter(item.scope)
    } catch (e) {
      value = ''
    }
    item.callback.call(this, value, item.scope)
  }
}

/**
 * Set deps recursively for a value which is an object.
 */
exports.setDeps = function(value, deps) {
  _.defineValue(value, '_deps', deps)
  for (var keys = Object.keys(deps), i = keys.length; i--;) {
    var key = keys[i]
    if (deps[key].sub && _.isObject(value[key])) {
      this.setDeps(value[key], deps[key].sub)
    }
  }
}

/**
 * Get depenteds of a special property.
 */
exports.getDeps = function(host, key) {
  return host._deps && host._deps[key]
}