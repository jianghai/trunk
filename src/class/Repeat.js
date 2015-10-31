/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule Repeat
 */

'use strict'

var config = require('../config')
var _      = require('../util')

/**
 * A class processing repeat directive.
 */
function Repeat(element, exp, scope, context) {

  this.context = context
  this.container = element.parentNode
  this.element = element
  this.docFrag = document.createDocumentFragment()

  // Cache child nodes to record relative position
  this.childNodes = [this.element]

  // Rerender when list reset
  this.context.addDeps(exp, _.bind(this.rerender, this), scope)

  this.list = this.context.get(exp, scope)

  // Prevent cycle compile
  element.removeAttribute(config.d_prefix + 'repeat')

  this.render()
}

/**
 * Hanles when native method of 'this.list' was called.
 */
Repeat.prototype.handles = {

  push: function() {
    var args = arguments
    for (var i = 0, len = args.length; i < len; i++) {
      this.childNodes.push(this.renderOne(args[i]))
    }
    this.container.appendChild(this.docFrag)
  },

  splice: function(start, deleteCount) {
    var i = start
    var limit = start + deleteCount
    while (i < limit) {
      this.container.removeChild(this.childNodes[i])
      i++
    }
    this.childNodes.splice(start, deleteCount)

    var args = arguments
    var argsLen = args.length
    if (argsLen > 2) {
      for (i = 2; i < argsLen; i++) {
        this.childNodes.splice(start, 0, this.renderOne(args[i]))
      }
      this.container.insertBefore(this.docFrag, this.childNodes[start + argsLen - 2])
    }
  },

  sort: function() {
    var res = []
    for (var i = 0, len = this.list.length; i < len; i++) {
      res[i] = this.childNodes[this.list[i].index]
      this.docFrag.appendChild(res[i])
    }
    res = null
    this.container.appendChild(this.docFrag)
  },

  pop: function() {
    this.handles.splice.call(this, this.list.length - 1, 1)
  },

  shift: function() {
    this.handles.splice.call(this, 0, 1)
  },

  unshift: function() {
    var args = arguments
    for (var i = 0, len = args.length; i < len; i++) {
      this.childNodes.unshift(this.renderOne(args[i]))
    }
    this.container.insertBefore(this.docFrag, this.childNodes[len])
  }
}

/**
 * Render all the list one by one.
 */
Repeat.prototype.render = function() {
  var i

  for (i = this.childNodes.length; i--; ) {
    this.container.removeChild(this.childNodes[i])
  }
  this.childNodes.length = []

  if (this.list) {
    i = 0
    for (var len = this.list.length; i < len; i++) {
      var item = this.list[i]
      // Save index for sort.
      _.defineValue(item, 'index', i)
      this.childNodes.push(this.renderOne(item))
    }
    this.container.appendChild(this.docFrag)
    for (var keys = Object.keys(this.handles), i = keys.length; i--; ) {
      var method = keys[i]
      _.initialize(this.list, [], 'on' + method)
      this.list['on' + method].push(_.bind(this.handles[method], this))
    }
  }
}

/**
 * Render single data and return the new node for outer usage.
 */
Repeat.prototype.renderOne = function(item) {
  var newNode = this.element.cloneNode(true)
  var self = this
  item._watchers || Object.defineProperties(item, {
    _watchers: {
      value: {}
    },
    remove: {
      configurable: false,
      enumerable: false,
      writable: false,
      value: function() {
        self.list.splice(self.childNodes.indexOf(newNode), 1)
      }
    }
  })
  newNode = this.context.compileNode(newNode, item)
  this.docFrag.appendChild(newNode)
  return newNode
}

/**
 * Reset status when list was reset.
 */
Repeat.prototype.rerender = function(list) {
  this.list = list
  this.render()
}

module.exports = Repeat