/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule index
 */

'use strict'

var config = require('../config')

var directives = Object.create(null)

var names = ['class', 'child', 'change', 'click', 'component', 'disabled', 'eq', 'if', 'model', 'not', 'on', 'props', 'repeat']

for (var i = names.length; i--;) {
  var _name = names[i]
  directives[config.d_prefix + _name] = require('./' + _name)
}

module.exports = directives