var compile = require('./compile')
var observe = require('./observe')

function Trunk(options) {

  for (var key in options) {
    this[key] = options[key]

    // if (typeof this[key] === 'function') {
    //   Object.defineProperty(this, key, {
    //     enumerable: false
    //   })
    // }
  }

  this.data || (this.data = {})

  // Object.defineProperty(this, 'el', {
  //   enumerable: false
  // })
  
  observe(this.data)

  if (this.computed) {
    observe(this.computed)
    Object.keys(this.computed).forEach(function(k) {
      var fn = this.computed[k]
      var that = this
      observe._computerSetter = function() {
        that.computed[k] = fn.call(that)
      }
      fn.value = fn.call(this)
      observe._computerSetter = null
    }, this)
  }

  Object.defineProperty(this.data, '_watchers', {
    value: {}
  })

  this.compileNode(document.querySelector(this.el) || document.body, this.data)
}

var p = Trunk.prototype
_.merge(p, compile)
// _.merge(p, compile)
// _.merge(p, compile)

module.exports = Trunk