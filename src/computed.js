/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule computed
 */

'use strict'

var _ = require('./util')

// Save computer uid index instead of 'Array.prototype.indexOf' for better performance
exports.uid = 0

/**
 * Change computed properties to normal data and initialize computs.
 */
exports.initComputed = function(key) {
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
exports.getComputedValue = function(computer) {
  var value
  var initComputer = this._computer || null
  try {
    _.defineValue(this, '_computer', computer)
    value = computer.handle.call(this)
    _.defineValue(this, '_computer', initComputer)
  } catch(e) {
    value = ''
  }
  return value
}

/**
 * Add computed dependents to the object which tirgger getter.
 */
exports.addComputs = function(host, key) {

  if (!this._computer) return

  _.initialize(host, [], '_computs', key)
  var handles = host._computs[key]
  if (!handles.hasOwnProperty(this._computer.uid)) {
    handles.push(this._computer)
    _.defineValue(handles, this._computer.uid, true)
  }
}

/**
 * Invoke computed dependents.
 */
exports.traverseComputs = function(host, key) {
  if (!host._computs || !host._computs[key]) return
  var computes = host._computs[key]
  for (var i = computes.length; i--; ) {
    var computer = computes[i]
    this[computer.key] = this.getComputedValue(computer)
  }
}