/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule props
 */

'use strict'

/**
 * Record current data fields to set data for the child component (equivalent with the 'props' 
 * property of the component options). Split by comma in case of multiple fields. This directive 
 * could only be used on custom tag element.
 */
module.exports = function(element, exp, scope) {
  scope.__props = exp
}