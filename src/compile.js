/**
 * Copyright (c) 2015 https://github.com/jianghai/radar
 *
 * This source code is licensed under MIT license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 * 
 * @providesModule compile
 */

'use strict'

var _          = require('./util')
var directives = require('./directives')
var config     = require('./config')

// Mustchcae template regular expression
var textPattern = new RegExp(config.openRE + '(.+?)' + config.closeRE, 'g')

/**
 * Different node type, different compile logic.
 */
var nodeTypeHandles = {

  // ELEMENT_NODE
  1: function(node, scope) {
    var attributes = _.toArray(node.attributes)
    for (var i = 0, len = attributes.length; i < len; i++) {
      if (this.compileAttribute(attributes[i], scope) === false) {
        return false
      }
    }
  },

  // TEXT_NODE, split string to multiple text nodes which could be update not indifferent.
  3: function(node, scope) {
    var value = node.nodeValue
    if (/^\s*$/.test(value)) return
    var match
    var fragments = []
    var lastIndex = textPattern.lastIndex = 0
    while ((match = textPattern.exec(value)) !== null) {
      var index = match.index
      if (index > lastIndex) {
        fragments.push({
          value: value.slice(lastIndex, index)
        })
      }
      fragments.push({
        isBind: true,
        value: match[0],
        exp: match[1]
      })
      lastIndex = textPattern.lastIndex || index + match[0].length
    }
    if (lastIndex < value.length) {
      fragments.push({
        value: value.slice(lastIndex)
      })
    }
    var docFrag = document.createDocumentFragment()

    for (var i = 0, len = fragments.length; i < len; i++) {
      var fragment = fragments[i]
      var textNode = document.createTextNode(fragment.value)
      docFrag.appendChild(textNode)
      if (fragment.isBind) {
        var exp = fragment.exp
        this.addDeps(exp, function(value) {
          textNode.nodeValue = value
        }, scope)
        textNode.nodeValue = this.get(exp, scope)
      }
    }
    node.parentNode.replaceChild(docFrag, node)
  }
}

/**
 * Invoke corresponding directive.
 */
exports.compileAttribute = function(attribute, scope) {
  var name = attribute.name
  if (!directives[name]) return
  return directives[name].call(this, attribute.ownerElement, attribute.value, scope)
}

/**
 * Not all element would be compiled.
 */
var ignoreTagsMap = Object.create(null)
var ignoreTags = ['script', 'link', 'style', 'template']
for (var i = ignoreTags.length; i--; ) {
  ignoreTagsMap[ignoreTags[i]] = true
}

/**
 * Node walker.
 */
exports.compileNode = function(node, scope) {

  var handle = nodeTypeHandles[node.nodeType]
  if (!handle) return

  var tagName = node.tagName
  if (tagName) {
    tagName = tagName.toLowerCase()
    if (ignoreTagsMap[tagName]) return
  }
  
  // Stop compile childNodes when the result of handle is false
  if (handle.call(this, node, scope) !== false) {
    if (this.components[tagName]) {
      return this.compileComponent(node, tagName, scope)
    }
    var childNodes = node.childNodes
    for (var i = childNodes.length; i--;) {
      this.compileNode(childNodes[i], scope)
    }
  }
}

/**
 * For custom tag, create data relationship with parent scope.
 */
exports.compileComponent = function(node, tagName, scope) {
  var options = this.components[tagName]

  var dataKey = node.getAttribute(config.d_prefix + 'data')
  if (dataKey) {
    this.addDeps(dataKey, function(value) {
      // Prevent cricle dependents
      scope.__circleDep = true
      component.__circleDep || (component[dataKey] = value)
      delete scope.__circleDep
    }, scope)
    options.data || (options.data = {})
    options.data[dataKey] = scope[dataKey]
  }

  options.parent = scope
  options._el || (options._el = node.firstElementChild)
  options.el = options._el.cloneNode(true)
  node.parentNode.replaceChild(options.el, node)
  
  var component = new this.constructor(options)

  if (dataKey) {
    this.addDeps(dataKey, function(value) {
      // Prevent cricle dependents
      component.__circleDep = true
      scope.__circleDep || (scope[dataKey] = value)
      delete component.__circleDep
    }, component)
  }
  
  _.initialize(this, [], '_components', tagName)
  this._components[tagName].push(component)
}