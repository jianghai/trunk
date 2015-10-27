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
 * Register componet and save the config.
 */
module.exports = function(name, options) {
  this.prototype.components[name] = options
}