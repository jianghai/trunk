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
    return _cloneNode
  }

  function render(list) {

    childNodes.forEach(function(childNode) {
      container.removeChild(childNode)
    })

    childNodes.length = []

    list && list.forEach(function(item) {
      childNodes.push(renderOne.call(this, item, list))
    }, this)

    container.appendChild(docFrag)

    var handles = {
      
      push: function() {
        var args = arguments
        for (var i = 0, len = args.length; i < len; i++) {
          childNodes.push(renderOne.call(context, args[i], this))
        }
        container.appendChild(docFrag)
      },
      
      splice: function(start, deleteCount) {
        var i = 0
        while (i < deleteCount) {
          container.removeChild(childNodes[start + i])
          i++
        }
        childNodes.splice(start, deleteCount)

        var args = arguments
        if (args.length > 2) {
          for (var i = 2, len = args.length; i < len; i++) {
            childNodes.splice(start, 0, renderOne.call(context, args[i], this))
          }
          container.insertBefore(docFrag, childNodes[start + len - 2])
        }
      }
    }

    for (var k in handles) {
      _.initialize(list, [], 'on' + k)
      list['on' + k].push(handles[k])
    }
  }

  render.call(this, list)

  // Rerender when list reset
  this.addDeps(exp, _.bind(render, this), scope)
}