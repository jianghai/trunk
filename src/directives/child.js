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

function injectComponent(instance, scope, name, parent) {
  
  if (!cache[name]) {
    
    var options = instance._getComponentOptions(name)
    if (!options) {
      throw 'No component named ' + name
    }
    
    options.parent = scope
    
    parent.appendChild(options.el)
    
    cache[name] = new instance.constructor(options)
  }
  parent.appendChild(cache[name].el)
}

/**
 * Append a dynamic component.
 */
module.exports = function(element, exp, scope) {

  this.addDeps(exp, function(value, scope) {
  
    _.remove(cache[last].el)
  
    if (!value || typeof value !== 'string') return
  
    injectComponent(this, scope, value, element)
  
    last = value
  }, scope)

  last = this.get(exp, scope)
  injectComponent(this, scope, last, element)
}