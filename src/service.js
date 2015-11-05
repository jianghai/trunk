/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule service
 */

'use strict'

/**
 * 
 */
exports.fetch = function(url, callback) {
  var self = this
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status === 200) {
        callback.call(self, JSON.parse(this.responseText))
      }
    }
  }
  xhr.open('GET', url)
  xhr.send(null)
}