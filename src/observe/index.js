var _            = require('../util')
var ObserveArray = require('./ObserveArray')

function _observe(obj, k) {

  var context = this
  var _value = obj[k]

  function getter() {
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
  }

  function setter(value) {
    _value = value
    
    if (_.isObject(value)) {
      if (_.isArray(value)) {
        new ObserveArray(this, k, context)
        for (var i = 0, len = value.length; i < len; i++) {
          _.isObject(value[i]) && context.observe(value[i])
        }
      } else {
        context.observe(value)
      }
      try {
        var sub = this._deps[k].sub
        if (sub) {
          Object.defineProperty(value, '_deps', {
            value: sub
          })
        }
      } catch (e) {}
    }

    if (this._deps && this._deps[k]) {
      this._deps[k].handles.forEach(function(item) {
        var value
        try {
          value = item.getter(item.scope)
        } catch (e) {
          value = ''
        }
        item.handle(value)
      }, this)
    }
    
    if (this._computs && this._computs[k]) {
      this._computs[k].forEach(function(item) {
        var value
        try {
          value = item.handle.call(context)
        } catch (e) {
          value = ''
        }
        context[item.key] = value
      })
    }
  }
  Object.defineProperty(obj, k, {
    get: getter,
    set: setter
  })
}

/**
 * Define getter/setter for all enumerable properties to record computed handles and invokes 
 * depends & computed handles, redefine when the value of setter is object.
 * 
 * @param {object} obj The Object of define getter/setter
 */
function observe(obj) {

  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      _observe.call(this, obj, k)
      var _value = obj[k]
      if (_.isArray(_value)) {
        new ObserveArray(obj, k, this)
        for (var i = 0, len = _value.length; i < len; i++) {
          _.isObject(_value[i]) && this.observe(_value[i])
        }
      } else if (_.isObject(_value)) {
        this.observe(_value)
      }
    }
  }
}

module.exports = observe