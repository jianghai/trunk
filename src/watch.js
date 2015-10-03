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

exports.addDeps = function(exp, cb, scope) {

  var getter = scope._watchers[exp].getter
  var host = scope
  var match = exp.match(/[\w_]+/g)
  var handle = {
    scope: scope,
    getter: getter,
    cb: cb
  }

  host._deps || Object.defineProperty(host, '_deps', {
    value: {}
  })

  var deps = host._deps
  var i = 0
  var len = match.length

  while (i < len) {

    var key    = match[i]
    var isLast = i + 1 === len

    deps[key] || (deps[key] = {})
    deps = deps[key]
    deps.handles || (deps.handles = [])
    deps.handles.push(handle)

    if (!isLast) {
      deps.sub || (deps.sub = {})
      deps = deps.sub
    }

    // 如果子对象存在，绑定依赖，已经有依赖的扩展依赖
    if (host) {
      if (i > 0 && _.isObject(host)) {
        var handles = _.initialize(host, [], '_deps', key, 'handles')
        handles.push(handle)
        isLast || (host._deps[key].sub = deps)
      }
      host = host[key]
    }

    i++
  }
}