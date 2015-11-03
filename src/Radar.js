/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule Radar
 */

'use strict'

var _ = require('./util')

// Unenumerable options
var unenumerableMap = Object.create(null)
var unenumerableProperties = ['el', 'computed', 'components', 'template', 'parent', 'props']
for (var i = unenumerableProperties.length; i--; ) {
  unenumerableMap[unenumerableProperties[i]] = true
}

function Radar(options) {
  
  if (typeof options.el === 'string') {
    options.el = document.querySelector(options.el)
  } else if (!options.el) {
    options.el = document.body
  }

  for (var keys = Object.keys(options), i = keys.length; i--; ) {
    var prop = keys[i]
    this[prop] = options[prop]
      // Ignore properties when observe
    if (typeof this[prop] === 'function' || unenumerableMap[prop]) {
      Object.defineProperty(this, prop, {
        enumerable: false
      })
    }
  }

  // Computed value
  if (this.computed) {
    for (var keys = Object.keys(this.computed), i = keys.length; i--;) {
      this.initComputed(keys[i])
    }
    delete this.computed
  }

  this.data || (this.data = {})

  // Initialize _watchers container for watch
  _.defineValue(this, '_watchers', {})

  this.parent && this._bindRelatedProps()

  // Todo: is data required ?
  _.merge(this, this.data)
  delete this.data

  this.observe(this)

  this.compileNode(this.el, this)
}

Radar.prototype.observe = require('./observe')

_.merge(Radar, require('./global'))
_.merge(Radar.prototype, require('./compile'))
_.merge(Radar.prototype, require('./watch'))
_.merge(Radar.prototype, require('./component'))
_.merge(Radar.prototype, require('./computed'))
_.merge(Radar.prototype, require('./dependent'))

module.exports = Radar