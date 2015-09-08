function bind(obj, k) {
  var _value = obj[k]
  Object.defineProperty(obj, k, {
    get: function() {
      if (!this._deps) {
        Object.defineProperty(this, '_deps', {
          value: {}
        })
      }
      if (!this._deps[k]) {
        this._deps[k] = []
      }
      if (observe._computerSetter) {
        this._deps[k].push(observe._computerSetter)
      }
      return _value
    },
    set: function(value) {
      _value = value
      if (this._deps[k].length) {
        this._deps[k].forEach(function(fn) {
          fn(value)
        })
      }
    }
  })
}

function observe(obj, k) {
  
  if (typeof obj !== 'object' || obj === null) return

  k ? bind(obj, k) : Object.keys(obj).forEach(function(k) {
    
    bind(obj, k)
    observe(obj[k])
  })
}

module.exports = observe