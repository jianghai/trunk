/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule on
 */

'use strict'

var _ = require('../util')

/**
 * Bind one or multipe events.
 */
module.exports = function(element, map, scope) {
  _.mapParse(map, function(type, method) {
    _.on(element, type, method, scope, this)
  }, this)
}