var _ = require('./util')
var directives = require('./directives')
var config = require('./config')


var textPattern = new RegExp(config.openRE + '(.+?)' + config.closeRE, 'g')

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

  // TEXT_NODE
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
    fragments.forEach(function(fragment) {

      var textNode = document.createTextNode(fragment.value)
      docFrag.appendChild(textNode)

      if (fragment.isBind) {
        var exp = fragment.exp
        this.addDeps(exp, function(value) {
          textNode.nodeValue = value
        }, scope)
        textNode.nodeValue = this.get(exp, scope)
      }
    }, this)
    node.parentNode.replaceChild(docFrag, node)
  },

  // DOCUMENT_NODE
  // 9: function(node, scope) {
  //   _.toArray(node.attributes).forEach(compileAttribute, this)
  // }
}

exports.compileAttribute = function(attribute, scope) {
  var name = attribute.name
  if (!directives[name]) return
  return directives[name].call(this, attribute.ownerElement, attribute.value, scope)
}

var ignoreTags = Object.create(null);
['script', 'link', 'style', 'template'].forEach(function(tagName) {
  ignoreTags[tagName] = true
})

exports.compileNode = function(node, scope) {

  var handle = nodeTypeHandles[node.nodeType]
  if (!handle) return

  var tagName = node.tagName
  if (tagName) {
    tagName = tagName.toLowerCase()
    if (ignoreTags[tagName]) return
  }
  
  if (handle.call(this, node, scope) !== false) {
    if (this.components[tagName]) {
      return this.compileComponent(node, tagName, scope)
    }
    var childNodes = _.toArray(node.childNodes)
    for (var i = 0, len = childNodes.length; i< len; i++) {
      this.compileNode(childNodes[i], scope)
    }
  }
}

exports.compileComponent = function(node, tagName, scope) {
  var options = this.components[tagName]

  var dataKey = node.getAttribute(config.d_prefix + 'data')
  if (dataKey) {
    this.addDeps(dataKey, function(value) {
      // Prevent cricle dependency
      scope.__circleDep = true
      component.__circleDep || (component[dataKey] = value)
      delete scope.__circleDep
    }, scope)
    options.data || (options.data = {})
    options.data[dataKey] = scope[dataKey]
  }

  options.parent = scope
  options.el = options._el.cloneNode(true)
  node.parentNode.replaceChild(options.el, node)
  
  var component = new Trunk(options)

  if (dataKey) {
    this.addDeps(dataKey, function(value) {
      // Prevent cricle dependency
      component.__circleDep = true
      scope.__circleDep || (scope[dataKey] = value)
      delete component.__circleDep
    }, component)
  }
  
  _.initialize(this, [], '_components', tagName)
  this._components[tagName].push(component)
}