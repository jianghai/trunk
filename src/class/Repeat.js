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
var _ = require('../util')

/**
 * A class processing repeat directive.
 */
function Repeat(element, exp, scope, context) {

  this.context = context
  this.element = element
  this.previousNode = element.previousSibling
  this.container = element.parentNode
  this.docFrag = document.createDocumentFragment()
  this.isComponent = context._getComponentOptions(element.tagName.toLowerCase()) || element.getAttribute(config.d_prefix + 'component')

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
 * Handles when native method of 'this.list' was called.
 */
Repeat.prototype.nativeHandles = {

  push: function() {
    var args = arguments
    var nextNode = this.childNodes[this.list.length - 1].nextSibling
    for (var i = 0, len = args.length; i < len; i++) {
      this.childNodes.push(this.renderOne(args[i]))
    }
    this.container.insertBefore(this.docFrag, nextNode)
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
    var len = this.list.length
    var nextNode = this.childNodes[len - 1].nextSibling
    for (var i = 0; i < len; i++) {
      res[i] = this.childNodes[this.list[i].index]
      this.docFrag.appendChild(res[i])
    }
    res = null
    this.container.insertBefore(this.docFrag, nextNode)
  },

  pop: function() {
    this.nativeHandles.splice.call(this, this.list.length - 1, 1)
  },

  shift: function() {
    this.nativeHandles.splice.call(this, 0, 1)
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
    this.container.insertBefore(this.docFrag, _.getExistPreviousSibling(this.previousNode).nextSibling)

    // Bind events when use native methods
    var keys = Object.keys(this.nativeHandles)
    for (i = keys.length; i--; ) {
      var method = keys[i]
      _.initialize(this.list, [], 'on' + method)
      this.list['on' + method].push(_.bind(this.nativeHandles[method], this))
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
    parent: {
      value: this.context
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
  // Create data relationship if list item is component
  this.isComponent && _.defineValue(item, '__props', Object.keys(item))

  newNode = this.context.compileNode(newNode, item)
  if (item.__outsideCallback) {
    item.__outsideCallback(this.container, newNode.previousSibling || this.previousNode)
    delete item.__outsideCallback
  } else {
    this.docFrag.appendChild(newNode)
  }
  
  this.context._destroyElseCache(item)
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