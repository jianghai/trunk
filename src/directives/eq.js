/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule eq
 */

'use strict'

var _      = require('../util')
var config = require('../config')
var toggle = require('./_toggle')

/**
 * exp: value
 * If the value of exp is not equal to value, remove the target element, stop compile childNodes.
 * It also keep watching the value of exp to update the DOM.
 */
module.exports = function(element, exp, scope) {

  // Prevent recompile
  element.removeAttribute(config.d_prefix + 'eq')

  exp = exp.split(':')

  var compareValue = exp[1].trim()
  exp = exp[0].trim()

  var bool = this.get(exp, scope) + '' === compareValue

  toggle.call(this, element, exp, scope, bool, function(value) {
    return value + '' === compareValue
  })

  return bool
}