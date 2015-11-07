/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule dom
 */

'use strict'

/**
 * Get node index relative to sibling.
 */
exports.index = function(nodeList, child) {
  return Array.prototype.indexOf.call(nodeList, child)
}

/**
 * Add or remove className according to the condition.
 */
exports.toggleClass = function(element, className, condition) {
  element.classList.toggle(className, condition)
}

/**
 * Remove all childNodes of the given node.
 */
exports.empty = function(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

/**
 * Remove the given node self.
 */
exports.remove = function(element) {
  element.parentNode.removeChild(element)
}

/**
 * Bind node events which handle is the scope method or context method.
 * Prevent default event ation and stop event bubble is default.
 */
exports.on = function(element, type, method, scope, context) {
  element.addEventListener(type, function(e) {
    e.preventDefault()
    e.stopPropagation()
    typeof context[method] === 'function' ? context[method](scope, e) : scope[method]()
  })
}

/**
 * Not until the node was in document
 */
exports.getExistPreviousSibling = function(previous) {
  while (!previous.parentNode) {
    previous = previous.previousSibling
  }
  return previous
}