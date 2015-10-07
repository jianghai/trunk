var _ = require('./util')
var ObserveArray = require('./class/ObserveArray')

function _bindDeps(value, deps) {
  Object.defineProperty(value, '_deps', {
    value: deps
  })
  for (var k in deps) {
    if (deps[k].sub && _.isObject(value[k])) {
      _bindDeps(value[k], deps[k].sub)
    }
  }
}

function _observeArray(host, key, context) {
  var array = host[key]
  var isArray = _.isArray(array)
  if (isArray) {
    new ObserveArray(host, key, context)
    for (var i = 0, len = array.length; i < len; i++) {
      _.isObject(array[i]) && context.observe(array[i])
    }
  }
  return isArray
}

function _observe(obj, k) {

  var context = this
  var _value = obj[k]

  function getter() {
    if (context._computer) {
      _.initialize(this, [], '_computs', k)
      var _computs = this._computs[k]
      if (_computs.indexOf(context._computer) === -1) {
        _computs.push(context._computer)
      }
    }
    return _value
  }

  function setter(value) {
    _value = value


    if (_.isObject(value)) {

      _observeArray(this, k, context) || context.observe(value)

      var sub = this._deps && this._deps[k] && this._deps[k].sub
      sub && _bindDeps(value, sub)
    }

    if (this._deps && this._deps[k]) {
      this._deps[k].handles.forEach(function(item) {
        var value
        try {
          value = item.getter(item.scope)
        } catch (e) {
          value = ''
        }
        item.cb(value)
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
      if (!_observeArray(obj, k, this)) {
        _.isObject(_value) && this.observe(_value)
      }
    }
  }
}

module.exports = observe