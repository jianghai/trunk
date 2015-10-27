/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule disabled
 */

'use strict'

/**
 * Set disabled or not of a node.
 */
module.exports = function(element, exp, scope) {
  this.addDeps(exp, function(value) {
    element.disabled = !!value
  }, scope)
  element.disabled = !!this.get(exp, scope)
}