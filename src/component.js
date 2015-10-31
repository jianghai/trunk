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

/**
 * Create data fields relationship between parent and child Radar instance.
 */
exports._bindRelatedProps = function() {

  var props = this._getRelatedProps()

  if (!props) return

  var parent = this.parent

  for (var i = props.length; i--; ) {
    var prop = props[i]

    // Trigger change when parent change.
    this.addDeps(prop, function(value, scope) {
      // Prevent cricle dependents
      scope.__circleDep = true
      this.__circleDep || (this[prop] = value)
      delete scope.__circleDep
    }, this.parent)

    this.data[prop] = this.parent[prop]

    // Trigger parent change when change.
    this.addDeps(prop, function(value, scope) {
      // Prevent cricle dependents
      scope.__circleDep = true
      parent.__circleDep || (parent[prop] = value)
      delete scope.__circleDep
    }, this)
  }
}

/**
 * Merge directive and options props without repetition to create data fields relationship 
 * between parent and child Radar instance.
 */
exports._getRelatedProps = function() {
  var res
  var _props = this.parent.__props
  if (_props || this.props) {
    res = []
    if (_props) {
      _props = _props.split(',')
      for (var i = _props.length; i--; ) {
        res[i] = _props[i].trim()
      }
      delete this.parent.__props
    }
    if (this.props) {
      for (var i = this.props.length; i--; ) {
        var prop = this.props[i]
        res.indexOf(prop) === -1 && res.push(prop)
      }
    }
  }
  return res
}