/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule model
 */

'use strict'

/**
 * Different input element logic.
 */
var inputHandles = {

  text: function(element, exp, scope) {
    var self = this
    this.addDeps(exp, function(value) {
      element.value === value || (element.value = value)
    }, scope)
    element.value = this.get(exp, scope)
    element.addEventListener('input', function() {
      self.set(exp, this.value, scope)
    })
  },

  checkbox: function(element, exp, scope) {
    var self = this
    this.addDeps(exp, function(value) {
      element.checked === value || (element.checked = value)
    }, scope)
    element.checked = this.get(exp, scope)
    element.addEventListener('change', function() {
      self.set(exp, this.checked, scope)
    })
  }
}

/**
 * Dofferent user input logic.
 */
var modelHandles = {

  input: function(element) {
    inputHandles[element.type].apply(this, arguments)
  },
  
  select: function(element, exp, scope) {
    var self = this
    this.addDeps(exp, function(value) {
      element.value === value
    }, scope)
    element.value = this.get(exp, scope)
    element.addEventListener('change', function() {
      self.set(exp, this.value, scope)
    })
  },
  
  textarea: function() {
    inputHandles.text.apply(this, arguments)
  }
}

/**
 * Two way binding, DOM and data.
 */
module.exports = function(element, exp, scope) {
  var tag = element.tagName.toLowerCase()
  modelHandles[tag] && modelHandles[tag].apply(this, arguments)
}