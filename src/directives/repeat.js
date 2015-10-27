/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule repeat
 */

'use strict'

var Repeat = require('../class/Repeat')

/**
 * Render an Array date.
 */
module.exports = function(element, exp, scope) {
  new Repeat(element, exp, scope, this)
  return false
}