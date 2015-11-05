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

  // Register a global component and save the options.
  component: function(name, options) {
    this.prototype.components[name] = options
  },

  // Save computer uid index instead of 'Array.prototype.indexOf' for better performance
  uid: 0,

  events: {}
}