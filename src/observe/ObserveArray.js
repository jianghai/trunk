
function ObserveArray(host, key, context) {
  this.host = host
  this.key = key
  this.context = context

  var list = host[key]

  ;['push', 'splice', 'sort'].forEach(function(method) {

    var self = this

    Object.defineProperty(list, method, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: function() {

        var args = arguments
        Array.prototype[method].apply(this, args)

        this['on' + method] && this['on' + method].forEach(function(fn) {
          fn.apply(this, args)
        }, this)

        self.hasComputs = !!(self.host._computs && self.host._computs[self.key])

        self[method] && self[method].apply(self, args)
      }
    })
  }, this)
}

ObserveArray.prototype.push = function() {
  var args = arguments
  for (var i = 0; i < args.length; i++) {
    this.context.observe(args[i])
  }
  if (this.hasComputs) {
    this.host._computs[this.key].forEach(function(item) {
      this._computer = item
      var _value = item.handle.call(this)
      this._computer = null
      this[item.key] = _value
    }, this.context)
  }
}

ObserveArray.prototype.splice = function() {
  var args = arguments
  if (args.length > 2) {
    this.push.apply(this, Array.prototype.slice.call(args, 2))
  } else {
    if (this.hasComputs) {
      this.host._computs[this.key].forEach(function(item) {
        this[item.key] = item.handle.call(this)
      }, this.context)
    }
  }
}

ObserveArray.prototype.sort = function() {
  this.host[this.key] = this.host[this.key]
}

module.exports = ObserveArray