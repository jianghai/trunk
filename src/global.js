/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule global
 */

'use strict'

/**
 * Static properties and methods of constructor.
 */
module.exports = {

  // Container of global components options
  components: {},

  // Register a global component and save the options.
  components: function(name, options) {
    this.components[name] = options
  }
}