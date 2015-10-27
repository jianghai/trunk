/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule change
 */

'use strict'

var _ = require('../util')

/**
 * Bind change event.
 */
module.exports = function(element, method, scope) {
  _.on(element, 'change', method, scope, this)
}