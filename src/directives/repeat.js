var config = require('../config')
var _      = require('../util')

module.exports = function(element, exp, scope) {

  // exp = exp.split(' in ')

  // scope = this.getScope(exp[1], scope)

  var list = this.get(exp, scope)

  if (!list) {
    list = []
    this.set(exp, list, scope)
  }
  
  // Prevent cycle compile
  element.removeAttribute(config.d_prefix + 'repeat')

  var context = this
  var container = element.parentNode
  var cloneNode = element.cloneNode(true)
  var docFrag = document.createDocumentFragment()

  function renderOne(item, list) {
    var _cloneNode = cloneNode.cloneNode(true)
    // var _data = {}
    // _data[exp[0]] = item
    var _data = item

    Object.defineProperties(_data, {
      // _namespace: {
      //   value: exp[0]
      // },
      // _parent: {
      //   value: scope
      // },
      _watchers: {
        value: {}
      },
      $remove: {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
          list.splice(_.index(container, _cloneNode), 1)
        }
      }
    })

    this.compileNode(_cloneNode, _data)
    docFrag.appendChild(_cloneNode)
  }

  function render(list) {
    list && list.forEach(function(item) {
      renderOne.call(this, item, list)
    }, this)
    _.empty(container)
    container.appendChild(docFrag)
  }

  render.call(this, list)

  // Rerender when list reset
  this.addDeps(exp, _.bind(render, this), scope)

  ;['push', 'splice'].forEach(function(method) {
    _.initialize(list, '_on' + method, [])
  })

  list._onpush.push(function() {
    var args = arguments
    for (var i = 0; i < args.length; i++) {
      renderOne.call(context, args[i], this)
    }
    container.appendChild(docFrag)
  })

  list._onsplice.push(function(start, deleteCount) {
    var children = container.children
    var i = 0
    while(i < deleteCount) {
      container.removeChild(children[start])
      i++
    }
  })

  // Stop compile childNodes
  _.empty(element)
}