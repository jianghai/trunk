/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule _toggle
 */

'use strict'

var _ = require('../util')

/**
 * Watching condition change to remove or insert current element node.
 */
module.exports = function(element, exp, scope, bool, parseValue) {

  var parentNode = element.parentNode
  var nodeList = parentNode.childNodes
  var nextNodeIndex = Array.prototype.indexOf.call(nodeList, element) + 1
  var lastBool = bool

  if (!bool) {
    _.remove(element)
  }

  this.addDeps(exp, function(value) {
    value = parseValue ? parseValue(value) : !!value
    if (lastBool === value) return
    if (!value) {
      _.remove(element)
    } else {
      parentNode.insertBefore(element, nodeList[nextNodeIndex])
      if (!bool) {
        element = this.compileNode(element, scope)
      }
    }
    lastBool = value
  }, scope)
}