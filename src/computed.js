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
        uid: '_computer_' + this.constructor.uid++,
        context: this,
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
  // For nested computed value
  var initComputer = this.constructor._computer || null
  _.defineValue(this.constructor, '_computer', computer)
  try {
    value = computer.handle.call(computer.context)
  } catch(e) {
    value = ''
  } finally {
    // Reset to default value when got an error
    _.defineValue(this.constructor, '_computer', initComputer)
  }
  return value
}

/**
 * Add computed dependents to the object which tirgger getter.
 */
exports.addComputs = function(host, key) {

  var _computer = this.constructor._computer
  if (!_computer) return

  _.initialize(host, [], '_computs', key)
  var handles = host._computs[key]
  if (!handles.hasOwnProperty(_computer.uid)) {
    handles.push(_computer)
    _.defineValue(handles, _computer.uid, true)
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
    computer.context[computer.key] = this.getComputedValue(computer)
  }
}