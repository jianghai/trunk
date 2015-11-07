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
module.exports = function(element, exp, scope, opposite) {

  var parentNode = element.parentNode
  var previousNode = element.previousSibling

  var initValue = this.get(exp, scope)
  initValue = opposite ? !initValue : !!initValue
  var lastValue = initValue

  if (parentNode) {
    initValue || _.remove(element)
  } else {
    _.defineValue(scope, '__outsideCallback', function(parent, previous) {
      parentNode = parent
      previousNode = previous
    })
  }

  this.addDeps(exp, function(value) {
    value = opposite ? !value : !!value
    if (lastValue === value) return
    if (!value) {
      _.remove(element)
    } else {
      if (!initValue) {
        element = this.compileNode(element, scope)
      }
      parentNode.insertBefore(element, _.getExistPreviousSibling(previousNode).nextSibling)
    }
    lastValue = value
  }, scope)

  return initValue
}