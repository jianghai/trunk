var _ = require('./util')

exports.watch = function(exp, scope) {

  if (scope._watchers[exp]) return

  scope._watchers[exp] = {
    getter: new Function('scope', 'return scope.' + exp),
    setter: new Function('value', 'scope', 'scope.' + exp + ' = value')
  }
}

exports.get = function(exp, scope) {
  var value
  try {
    value = scope._watchers[exp].getter(scope)
  } catch (e) {
    value = ''
  }
  return value
}

exports.set = function(exp, value, scope) {
  scope._watchers[exp].setter(value, scope)
}

// exports.getScope = function(exp, scope) {
//   var _namespace
//   var _match = exp.match(/[\w_]+/)[0]
//   while ((_namespace = scope._namespace) && _match !== _namespace) {
//     scope = scope._parent
//   }
//   return scope
// }

exports.addDeps = function(exp, handle, scope) {

  var getter = scope._watchers[exp].getter
  var host = scope
  var match = exp.match(/[\w_]+/g)
  var i = 0
  var len = match.length
  var deps
  var key

  host._deps || Object.defineProperty(host, '_deps', {
    configurable: true,
    value: {}
  })
  deps = host._deps

  while (i < len) {

    key = match[i]

    if (host) {
      if (i > 0 && _.isObject(host)) {
        Object.defineProperty(host, '_deps', {
          configurable: true,
          value: deps
        })
      }
      host = host[key]
    }

    deps[key] || (deps[key] = {})
    deps = deps[key]
    deps.handles || (deps.handles = [])
    deps.handles.push({
      scope: scope,
      getter: getter,
      handle: handle
    })

    if (i + 1 < len) {
      deps.sub || (deps.sub = {})
      deps = deps.sub
    }

    i++
  }
}