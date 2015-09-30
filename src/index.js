var compile = require('./compile')
var watch   = require('./watch')
var observe = require('./observe')
var component = require('./component')
var _       = require('./util')


var unenumerableMap = Object.create(null)
;['el', 'computed', 'template'].forEach(function(property) {
  unenumerableMap[property] = true
})

function Trunk(options) {

  typeof options.el === 'string' && (options.el = document.querySelector(this.el))
  
  for (var key in options) {
    this[key] = options[key]

    if (typeof this[key] === 'function' || unenumerableMap[key]) {
      Object.defineProperty(this, key, {
        enumerable: false
      })
    }
  }

  this.data || (this.data = {})

  _.merge(this, this.data)
  delete this.data


  if (this.computed) {
    Object.keys(this.computed).forEach(function(k) {
      var item = this.computed[k]
      var context = this
      var _value
      var _hasGet = false
      Object.defineProperty(this, k, {
        configurable: true,
        enumerable: true,
        get: function() {
          if (!_hasGet) {
            // 记录Computed自身的依赖
            if (this._computer) {
              this._computs || Object.defineProperty(this, '_computs', {
                value: {}
              })
              this._computs[k] || (this._computs[k] = [])
              if (this._computs[k].indexOf(this._computer) === -1) {
                this._computs[k].push(this._computer)
              }
            }
            // 初始化绑定依赖
            this._computer = {
              key: k,
              handle: item
            }
            _value = item.call(this)
            _hasGet = true
            this._computer = null
          }
          return _value
        }
      })
    }, this)
    delete this.computed
  }

  this.observe(this)

  Object.defineProperty(this, '_watchers', {
    value: {}
  })

  this.compileNode(this.el || document.body, this)
}

Trunk.component = component
var p = Trunk.prototype
p.components = {}
p.observe = observe
_.merge(p, compile)
_.merge(p, watch)

module.exports = Trunk