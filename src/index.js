/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule index
 */

'use strict'

var compile   = require('./compile')
var watch     = require('./watch')
var observe   = require('./observe')
var component = require('./component')
var _         = require('./util')


// Unenumerable options
var unenumerableMap = Object.create(null)
var unenumerableProperties = ['el', 'computed', 'template', '_el', 'parent']
for (var i = unenumerableProperties.length; i--; ) {
  unenumerableMap[unenumerableProperties[i]] = true
}

function Radar(options) {

  // Getting compile range ready
  if (typeof options.el === 'string') {
    options.el = document.querySelector(options.el)
  } else if (!options.el) {
    options.el = document.body
  }

  for (var prop in options) {
    this[prop] = options[prop]
      // Ignore properties when observe
    if (typeof this[prop] === 'function' || unenumerableMap[prop]) {
      Object.defineProperty(this, prop, {
        enumerable: false
      })
    }
  }

  // Computed value
  if (this.computed) {
    for (var keys = Object.keys(this.computed), i = keys.length; i--;) {
      this.initComputed(keys[i])
    }
    delete this.computed
  }

  // Todo: is data required ?
  if (this.data) {
    _.merge(this, this.data)
    delete this.data
  }

  this.observe(this)

  // Initialize _watchers container for watch
  _.defineValue(this, '_watchers', {})

  this.compileNode(this.el, this)
}

// Register component
Radar.component = component

// Save components options
Radar.prototype.components = {}


// Computer uid for better performance of indexOf
Radar.prototype.uid = 0

/**
 * Change computed properties to normal data and initialize computs.
 */
Radar.prototype.initComputed = function(key) {
  var handle = this.computed[key]
  // Cache the value
  var value
  // Avoid computed again
  var hasGet = false

  var getter = function() {
    if (!hasGet) {
      // For self computed dependents
      this.addComputs(this, key)
      value = this.getComputedValue({
        uid: '_computer_' + this.uid++,
        key: key,
        handle: handle
      })
      hasGet = true
    }
    return value
  }
  Object.defineProperty(this, key, {
    configurable: true,
    enumerable: true,
    get: getter
  })
}

/**
 * Get calculate computed value and record computer for possible usage.
 */
Radar.prototype.getComputedValue = function(computer) {
  var value
  try {
    _.defineValue(this, '_computer', computer)
    value = computer.handle.call(this)
    _.defineValue(this, '_computer', null)
  } catch(e) {
    value = ''
  }
  return value
}

/**
 * Add computed dependents to the object which tirgger getter.
 */
Radar.prototype.addComputs = function(host, key) {
  if (this._computer) {
    _.initialize(host, [], '_computs', key)
    var handles = host._computs[key]
    if (!handles.hasOwnProperty(this._computer.uid)) {
      handles.push(this._computer)
      _.defineValue(handles, this._computer.uid, true)
    }
  }
}

/**
 * Invoke dependents.
 */
Radar.prototype.traverseDeps = function(host, key) {
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
    item.callback.call(this, value)
  }
}

/**
 * Invoke computed dependents.
 */
Radar.prototype.traverseComputs = function(host, key) {
  if (!host._computs || !host._computs[key]) return
  var computes = host._computs[key]
  for (var i = computes.length; i--; ) {
    var computer = computes[i]
    this[computer.key] = this.getComputedValue(computer)
  }
}

/**
 * Set deps recursively for a value which is an object.
 */
Radar.prototype.setDeps = function(value, deps) {
  _.defineValue(value, '_deps', deps)
  for (var keys = Object.keys(deps), i = keys.length; i--;) {
    var key = keys[i]
    if (deps[key].sub && _.isObject(value[key])) {
      this.setDeps(value[key], deps[key].sub)
    }
  }
}

Radar.prototype.getDeps = function(host, key) {
  return host._deps && host._deps[key]
}

// Radar.prototype.getSubDeps = function(host, key) {
//   return this.getDeps(host, key).sub
// }

Radar.prototype.observe = observe

_.merge(Radar.prototype, compile)

_.merge(Radar.prototype, watch)

module.exports = Radar