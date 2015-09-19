var _ = require('./util')

function isWatching(exp, scope) {
  return !!scope._watchers[exp]
}

exports.watch = function(exp, scope) {

  if (isWatching(exp, scope)) return

  var match = exp.match(/[\w_]+/g)
  var prop = match.pop()
  var _host = scope
  match.forEach(function(prop) {
    if (typeof _host[prop] !== 'object' || _host[prop] === null) {
      _host[prop] = {}
      this.observe(_host, prop)
      // _host._deps.push(function(value) {
      //   _host[prop] = value[prop]
      // })
    }
    _host = _host[prop]
  }, this)
  if (!(prop in _host)) {
    _host[prop] = undefined
  }
  this.observe(_host, prop)
  scope._watchers[exp] = {
    host: _host,
    prop: prop
  }
}

exports.get = function(exp, scope) {
  var target = scope._watchers[exp]
  var value = target.host[target.prop]
  value === undefined && (value = '')
  return value
}

exports.set = function(exp, value, scope) {
  var target = scope._watchers[exp]
  target.host[target.prop] = value
}

// exports.getScope = function(exp, scope) {
//   var _namespace
//   var _match = exp.match(/[\w_]+/)[0]
//   while ((_namespace = scope._namespace) && _match !== _namespace) {
//     scope = scope._parent
//   }
//   return scope
// }

exports.addDeps = function(exp, fn, scope) {
  var target = scope._watchers[exp]

  _.initialize(target.host, '_deps', {})
  var _deps = target.host._deps
  _deps[target.prop] || (_deps[target.prop] = [])

  _deps[target.prop].push(fn)
}