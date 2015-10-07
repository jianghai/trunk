var _ = require('./util')
var directives = require('./directives')
var config = require('./config')
var watch = require('./watch')


var textPattern = new RegExp(config.openRE + '(.+?)' + config.closeRE, 'g')

var nodeTypeHandles = {

  // ELEMENT_NODE
  1: function(node, scope) {
    _.toArray(node.attributes).forEach(function(attribute) {
      this.compileAttribute(attribute, scope)
    }, this)
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
        this.watch(exp, scope)
        textNode.nodeValue = this.get(exp, scope)
        this.addDeps(exp, function(value) {
          textNode.nodeValue = value
        }, scope)
      }
    }, this)
    node.parentNode.replaceChild(docFrag, node)
  },

  // DOCUMENT_NODE
  // 9: function(node, scope) {
  //   _.toArray(node.attributes).forEach(compileAttribute, this)
  // }
}

var ignoreTags = Object.create(null);
['script', 'link', 'style', 'template'].forEach(function(tagName) {
  ignoreTags[tagName.toUpperCase()] = true
})

var ignoreWatchs = Object.create(null);
['click'].forEach(function(directive) {
  ignoreWatchs[config.d_prefix + directive] = true
})

exports.compileAttribute = function(attribute, scope) {
  var name = attribute.name
  var exp

  if (!directives[name]) return

  exp = attribute.value

  // Initialize getter & setter
  ignoreWatchs[name] || this.watch(exp, scope)
  directives[name].call(this, attribute.ownerElement, exp, scope)
}

exports.compileComponent = function(node, tag, options) {
  var dataKey = node.getAttribute('d-data')
  if (dataKey) {
    options.data || (options.data = {})
    options.data[dataKey] = this[dataKey]

    // options._deps = {}
    // options._deps[dataKey] = _.initialize(this, {}, '_deps', dataKey)
  }
  options.el = options._el.cloneNode(true)
  node.parentNode.replaceChild(options.el, node)
  this._components[tag] = new Trunk(options)
}

exports.compileNode = function(node, scope) {

  var handle = nodeTypeHandles[node.nodeType]
  if (!handle) return

  if (node.tagName) {
    // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
    if (ignoreTags[node.tagName]) return

    var tag = node.tagName.toLowerCase()
    var options = this.components[tag]
    if (options) {
      return this.compileComponent(node, tag, options)
    }
  }

  handle.call(this, node, scope)
  _.toArray(node.childNodes).forEach(function(node) {
    this.compileNode(node, scope)
  }, this)
}