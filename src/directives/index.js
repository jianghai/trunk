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

var names = ['class', 'change', 'click', 'disabled', 'eq', 'if', 'model', 'not', 'on', 'repeat']

for (var i = names.length; i--;) {
  var name = names[i]
  directives[config.d_prefix + name] = require('./' + name)
}

module.exports = directives