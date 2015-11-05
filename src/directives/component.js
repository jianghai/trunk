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

var _ = require('../util')
var config = require('../config')

/**
 * .
 */
module.exports = function(element, exp, scope) {

  element.removeAttribute(config.d_prefix + 'component')

  var options = this._getComponentOptions(exp)
  options.el = element
  options.parent = scope
  
  var component = new this.constructor(options)

  scope._components || (_.defineValue(scope, '_components', []))
  scope._components.push(component)

  return false
}