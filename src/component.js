/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule component
 */

'use strict'

function _bind(prop, context) {

  var parent = context.parent

  // Trigger change when parent change.
  context.addDeps(prop, function(value, scope) {
    // Prevent cricle dependents
    scope.__circleDep = true
    this.__circleDep || (this[prop] = value)
    delete scope.__circleDep
  }, context.parent)

  context.data[prop] = context.parent[prop]

  // Trigger parent change when change.
  context.addDeps(prop, function(value, scope) {
    // Prevent cricle dependents
    scope.__circleDep = true
    parent.__circleDep || (parent[prop] = value)
    delete scope.__circleDep
  }, context)
}

/**
 * Create data fields relationship between parent and child Radar instance.
 */
exports._bindRelatedProps = function() {

  var props = this._getRelatedProps()

  if (!props) return

  for (var i = props.length; i--; ) {
    _bind(props[i], this)
  }
}

/**
 * Merge directive and options props without repetition to create data fields relationship 
 * between parent and child Radar instance.
 */
exports._getRelatedProps = function() {
  var res, i
  var _props = this.parent.__props
  if (_props || this.props) {
    res = []
    if (_props) {
      _props = _props.split(',')
      for (i = _props.length; i--; ) {
        res[i] = _props[i].trim()
      }
      delete this.parent.__props
    }
    if (this.props) {
      for (i = this.props.length; i--; ) {
        var prop = this.props[i]
        res.indexOf(prop) === -1 && res.push(prop)
      }
    }
  }
  return res
}

// Container of global components options
exports.components = {},

/**
 * Get options of a component
 */
exports._getComponentOptions = function(name) {
  return this.components[name] || this.constructor.prototype.components[name]
}