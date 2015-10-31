/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule child
 */

'use strict'

var _ = require('../util')

// No need to recompile component
var cache = {}
var last

function getComponent(instance, scope, name) {
  if (!cache[name]) {
    var options = instance.components[name] || instance.constructor.components[name]
    options.parent = scope
    cache[name] = new instance.constructor(options)
  }
  return cache[name]
}

/**
 * Append a dynamic component.
 */
module.exports = function(element, exp, scope) {
  this.addDeps(exp, function(value, scope) {
    _.remove(cache[last])
    element.appendChild(getComponent(this, scope, value).el)
    last = value
  }, scope)

  last = this.get(exp, scope)
  element.appendChild(getComponent(this, scope, last).el)
}