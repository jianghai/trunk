/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule class
 */

'use strict'

var _ = require('../util')

/**
 * Watching condition change to update the className.
 */
module.exports = function(element, map, scope) {
  _.mapParse(map, function(name, condition) {
    this.addDeps(condition, function(value) {
      _.toggleClass(element, name, value)
    }, scope)
    _.toggleClass(element, name, this.get(condition, scope))
  }, this)
}