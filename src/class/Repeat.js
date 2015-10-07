var config = require('../config')
var _ = require('../util')

function Repeat(element, exp, scope, context) {

  this.list = context.get(exp, scope)

  // Prevent cycle compile
  element.removeAttribute(config.d_prefix + 'repeat')

  this.context = context
  this.container = element.parentNode
  this.cloneNode = element.cloneNode(true)
  this.docFrag = document.createDocumentFragment()
  this.childNodes = [element]

  // Stop compile childNodes
  _.empty(element)

  this.render()

  // Rerender when list reset
  this.context.addDeps(exp, _.bind(this.rerender, this), scope)
}

Repeat.prototype.handles = {
  
  push: function() {
    var args = arguments
    for (var i = 0, len = args.length; i < len; i++) {
      this.childNodes.push(this.renderOne(args[i]))
    }
    this.container.appendChild(this.docFrag)
  },

  splice: function(start, deleteCount) {
    var i = 0
    while (i < deleteCount) {
      this.container.removeChild(this.childNodes[start + i])
      i++
    }
    this.childNodes.splice(start, deleteCount)

    var args = arguments
    if (args.length > 2) {
      for (var i = 2, len = args.length; i < len; i++) {
        this.childNodes.splice(start, 0, this.renderOne(args[i]))
      }
      this.container.insertBefore(this.docFrag, this.childNodes[start + len - 2])
    }
  }
}

Repeat.prototype.render = function() {
  this.childNodes.forEach(function(childNode) {
    this.container.removeChild(childNode)
  }, this)

  this.childNodes.length = []

  this.list && this.list.forEach(function(item) {
    this.childNodes.push(this.renderOne(item))
  }, this)

  this.container.appendChild(this.docFrag)
  for (var k in this.handles) {
    _.initialize(this.list, [], 'on' + k)
    this.list['on' + k].push(_.bind(this.handles[k], this))
  }
}

Repeat.prototype.renderOne = function(item) {
  var _cloneNode = this.cloneNode.cloneNode(true)
  var _data = item

  var self = this
  _data._watchers || Object.defineProperties(_data, {
    _watchers: {
      value: {}
    },
    $remove: {
      configurable: false,
      enumerable: false,
      writable: false,
      value: function() {
        self.list.splice(self.childNodes.indexOf(_cloneNode), 1)
      }
    }
  })

  this.context.compileNode(_cloneNode, _data)
  this.docFrag.appendChild(_cloneNode)
  return _cloneNode
}

Repeat.prototype.rerender = function(list) {
  this.list = list
  this.render()
}

module.exports = Repeat