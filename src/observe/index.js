var _ = require('../util')

var arrayMap = Object.create(null)

arrayMap.push = function(hasComputs, host, key, args) {
  for (var i = 0; i < args.length; i++) {
    this.observe(args[i])
  }
  if (hasComputs) {
    host._computs[key].forEach(function(item) {
      this._computer = item
      item._value = item.handle.call(this)
      this._computer = null
    }, this)
  }
}

function bindArray(host, key) {

  ['push', 'splice'].forEach(function(method) {

    var context = this

    Object.defineProperty(host[key], method, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: function() {

        var args = arguments
        Array.prototype[method].apply(this, args)

        var _on = '_on' + method
        this[_on] && this[_on].forEach(function(fn) {
          fn.apply(this, args)
        }, this)

        var hasComputs = !!(host._computs && host._computs[key])

        arrayMap[method] && arrayMap[method].call(context, hasComputs, host, key, arguments)

        if (hasComputs) {
          host._computs[key].forEach(function(item) {
            context[item.key] = item._value
            delete item._value
          })
        }
      }
    })
  }, this)
}

function observe(obj, k) {

  if (k === undefined) {
    Object.keys(obj).forEach(function(k) {
      this.observe(obj, k)
    }, this)
    return
  }

  var context = this
  var _value = obj[k]

  Object.defineProperty(obj, k, {

    get: function() {

      if (context._computer) {
        this._computs || Object.defineProperty(this, '_computs', {
          value: {}
        })
        this._computs[k] || (this._computs[k] = [])

        if (this._computs[k].indexOf(context._computer) === -1) {
          this._computs[k].push(context._computer)
        }
      }
      return _value
    },

    set: function(value) {

      _value = value

      if (this._deps && this._deps[k]) {
        this._deps[k].forEach(function(fn) {
          fn(value)
        })
      }
      if (this._computs && this._computs[k]) {
        this._computs[k].forEach(function(item) {
          context[item.key] = item.handle.call(context)
        })
      }
    }
  })

  _.isArray(_value) && bindArray.call(this, obj, k)

  _.isObject(obj[k]) && this.observe(obj[k])
}

module.exports = observe