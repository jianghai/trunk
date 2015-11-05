/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule event
 */

'use strict'

var _ = require('./util')
var events = require('./global').events

/**
 * Communicate in different Radar instance by global event system.
 */
module.exports = {

  // Subscribe an event
  on: function(event, callback) {
    (events[event] || (events[event] = [])).push({
      context: this,
      callback: callback
    })
  },

  fire: function(event, value) {
    var _events = events[event]
    if (!_events) return
    for (var i = 0, len = _events.length; i < len; i++) {
      _events[i].callback.call(_events[i].context, value)
    }
  }
}