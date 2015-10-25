var config = require('../config')
var _ = require('../util')

function Repeat(element, exp, scope, context) {

  this.context = context
  this.container = element.parentNode
  this.element = element
  this.docFrag = document.createDocumentFragment()
  this.childNodes = [this.element]

  // Rerender when list reset
  this.context.addDeps(exp, _.bind(this.rerender, this), scope)

  this.list = context.get(exp, scope)

  // Prevent cycle compile
  element.removeAttribute(config.d_prefix + 'repeat')

  this.render()
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
    var _childNodes = this.childNodes.concat()
    this.list.forEach(function(item, i) {
      if (i !== item.index) {
        this.childNodes[i] = _childNodes[item.index]
      }
      this.docFrag.appendChild(this.childNodes[i])
    }, this)
    _childNodes = null
    this.container.appendChild(this.docFrag)
  },

  pop: function() {
    this.splice.call(this, this.list.length - 1, 1)
  },

  shift: function() {
    this.splice.call(this, 0, 1)
  },

  unshift: function() {
    var args = arguments
    for (var i = 0, len = args.length; i < len; i++) {
      this.childNodes.unshift(this.renderOne(args[i]))
    }
    this.container.insertBefore(this.docFrag, this.childNodes[len])
  }
}

Repeat.prototype.render = function() {
  this.childNodes.forEach(function(childNode) {
    this.container.removeChild(childNode)
  }, this)

  this.childNodes.length = []

  if (this.list) {
    this.list.forEach(function(item, i) {
      _.defineValue(item, 'index', i)
      this.childNodes.push(this.renderOne(item))
    }, this)

    this.container.appendChild(this.docFrag)
    for (var k in this.handles) {
      _.initialize(this.list, [], 'on' + k)
      this.list['on' + k].push(_.bind(this.handles[k], this))
    }
  }
}

Repeat.prototype.renderOne = function(item) {
  var _cloneNode = this.element.cloneNode(true)
  var _data = item

  var self = this
  _data._watchers || Object.defineProperties(_data, {
    _watchers: {
      value: {}
    },
    remove: {
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