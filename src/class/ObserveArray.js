/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule ObserveArray
 */

'use strict'

/**
 * Special handling for Array for some CRUD.
 */
function ObserveArray(host, key, context) {
  this.host = host
  this.key = key
  this.context = context
  this.list = this.host[this.key]
  this.init()
}

ObserveArray.prototype.init = function() {
  for (var keys = Object.keys(this.nativeHandles), i = keys.length; i--; ) {
    this.bind(keys[i])
  }
}

/**
 * Rewrite native method for handle dependents after excute.
 */
ObserveArray.prototype.bind = function(method) {
  var self = this
  Object.defineProperty(this.list, method, {
    configurable: true,
    enumerable: false,
    writable: false,
    value: function() {

      var args = arguments
      Array.prototype[method].apply(this, args)

      self.nativeHandles[method] && self.nativeHandles[method].apply(self, args)
      self.context.traverseComputs(self.host, self.key)

      // Trigger method event
      var eventHandles = this['on' + method]
      if (eventHandles) {
        for (var i = eventHandles.length; i--;) {
          eventHandles[i].apply(null, args)
        }
      }
    }
  })
}

/**
 * When push or splice new elements, invoke dependents、bind dependents self and initialize 
 * observe.
 */
ObserveArray.prototype.insert = function(value, index) {
  // Bind dependents if there are dependents already
  var deps = this.context.getDeps(this.list, index)
  if (deps) {
    // Invoke dependents once created
    this.context.traverseDeps(this.list, index)
    deps.sub && this.context.setDeps(value, deps.sub)
  }
  // Observe manaually
  this.context.observe(value)
}

/**
 * Different native method, different logic.
 */
ObserveArray.prototype.nativeHandles = {

  push: function() {
    var args = arguments
    var len = this.list.length
    for (var i = args.length; i--;) {
      this.insert(args[i], len - i)
    }
  },

  splice: function(start, deleteCount) {
    var i
    if (this.list._deps) {
      i = start
      var limit = start + deleteCount
      while (i < limit) {
        var deps = this.context.getDeps(this.list, i)
        if (deps) {
          // Invoke dependents once created
          this.context.traverseDeps(this.list, i)
        }
      }
    }
    var args = arguments
    var argsLen = args.length
    if (argsLen > 2) {
      for (i = 2; i < argsLen; i++) {
        this.insert(args[i], start + i)
      }
    }
  },

  sort: function() {
    var deps = this.list._deps
    if (deps) {
      for (var i = Object.key(deps); i--; ) {
        this.context.traverseDeps(this.list, deps[i])
      }      
    }
  },

  pop: function() {
    this.nativeHandles.splice.call(this, this.list.length - 1, 1)
  },

  shift: function() {
    this.nativeHandles.splice.call(this, 0, 1)
  },

  unshift: function() {
    var args = arguments
    for (var i = args.length; i--;) {
      this.insert(args[i], i)
    }
  }
}

module.exports = ObserveArray