/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule else
 */

'use strict'

var config = require('../config')
var toggle = require('./_toggle')

/**
 * If the value of exp is true, remove the target element, stop compile childNodes. It also keep 
 * watching the value of exp to update the DOM.
 */
module.exports = function(element, exp, scope) {

  // Prevent recompile
  element.removeAttribute(config.d_prefix + 'else')

  exp = scope.__else

  this._destroyElseCache(scope)

  return toggle.call(this, element, exp, scope, true)
}