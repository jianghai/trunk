var _          = require('./util')
var directives = require('./directives')
var config     = require('./config')
var watch     = require('./watch')


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
        watch.call(this, exp, scope)
        textNode.nodeValue = watch.get.call(this, exp, scope) || ''
        watch.addDeps.call(this, exp, function(value) {
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

// Much more
var ignoreTags = {
  SCRIPT: true,
  LINK: true,
  STYLE: true
}

exports.compileAttribute = function(attribute, scope) {
  var name = attribute.name
  // Todo: use charCodeAt
  if (name.indexOf(config.d_prefix) !== 0) return
  var exp = attribute.value
  if (!exp.trim()) return

  // Initialize getter & setter
  watch.call(this, exp, scope)
  directives[name].call(this, attribute.ownerElement, exp, scope)
}

exports.compileNode = function(node, scope) {

  // So far only support ELEMENT_NODE, TEXT_NODE, DOCUMENT_NODE
  if (ignoreTags[node.tagName]) return

  var handle = nodeTypeHandles[node.nodeType]
  if (!handle) return
  handle.call(this, node, scope)
  _.toArray(node.childNodes).forEach(function(node) {
    this.compileNode(node, scope)
  }, this)
}