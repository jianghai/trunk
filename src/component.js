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

  prop = prop.split(':')
  var _parentProp = prop[0].trim()
  var _childProp = prop[1] ? prop[1].trim() : _parentProp

  // Trigger change when parent change.
  context.addDeps(_parentProp, function(value, scope) {
    // Prevent cricle dependents
    parent.__circleDep = true
    context.__circleDep || (context[_childProp] = value)
    delete parent.__circleDep
  }, parent)

  context.data[_childProp] = context.parent[_parentProp]

  // Trigger parent change when change.
  context.addDeps(_childProp, function(value, scope) {
    // Prevent cricle dependents
    context.__circleDep = true
    parent.__circleDep || (parent[_parentProp] = value)
    delete context.__circleDep
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
      res = _props
      delete this.parent.__props
    }
    if (this.props) {
      res = res.concat(this.props)
    }
  }
  return res
}

// Container of global components options
exports.components = {},

/**
 * Get options of a component, initialize element if template exist.
 */
exports._getComponentOptions = function(name) {
  var options = this.components[name] || this.constructor.prototype.components[name]
  if (!options) return
  if (options.template) {
    if (typeof options.template === 'string') {
      options.template = document.querySelector(options.template).content.firstElementChild
    }
    options.el = options.template.cloneNode(true)
  }
  return options
}