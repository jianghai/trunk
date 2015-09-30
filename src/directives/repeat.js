var config = require('../config')
var _ = require('../util')

module.exports = function(element, exp, scope) {

  var list = this.get(exp, scope)

  // Prevent cycle compile
  element.removeAttribute(config.d_prefix + 'repeat')

  var context = this
  var container = element.parentNode
  var cloneNode = element.cloneNode(true)
  var docFrag = document.createDocumentFragment()
  var childNodes = [element]

  // Stop compile childNodes
  _.empty(element)

  function renderOne(item, list) {
    var _cloneNode = cloneNode.cloneNode(true)
    var _data = item

    _data._watchers || Object.defineProperties(_data, {
      _watchers: {
        value: {}
      },
      $remove: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
          list.splice(childNodes.indexOf(_cloneNode), 1)
        }
      }
    })

    this.compileNode(_cloneNode, _data)
    docFrag.appendChild(_cloneNode)
    childNodes.push(_cloneNode)
  }

  function render(list) {

    childNodes.forEach(function(childNode) {
      container.removeChild(childNode)
    })

    childNodes.length = []

    list && list.forEach(function(item) {
      renderOne.call(this, item, list)
    }, this)

    container.appendChild(docFrag)

    if (list.on) {
      list.on.push.push(function() {
        var args = arguments
        for (var i = 0; i < args.length; i++) {
          renderOne.call(context, args[i], this)
        }
        container.appendChild(docFrag)
      })

      list.on.splice.push(function(start, deleteCount) {
        var i = 0
        while (i < deleteCount) {
          container.removeChild(childNodes[start + i])
          i++
        }
        childNodes.splice(start, deleteCount)
      })
    }
  }

  render.call(this, list)

  // Rerender when list reset
  this.addDeps(exp, _.bind(render, this), scope)

  // var watcher = scope._watchers[exp]
  // ;['push', 'splice'].forEach(function(method) {
  //   _.initialize(watcher, '_on' + method, [])
  // })
}