var observe = require('./observe')

function isWatching(exp, scope) {
  return !!scope._watchers[exp]
}

function watch(exp, scope) {

  if (this.computed[exp]) return
   
  if (isWatching(exp, scope)) return

  var match = exp.match(/[\w_]+/g)
  var prop = match.pop()
  var _host = scope
  match.forEach(function(prop) {
    if (typeof _host[prop] !== 'object' || _host[prop] === null) {
      _host[prop] = {}
      observe(_host, prop)
      // _host._deps.push(function(value) {
      //   _host[prop] = value[prop]
      // })
    }
    _host = _host[prop]
  })
  _host[prop] || (_host[prop] = undefined)
  observe(_host, prop)
  scope._watchers[exp] = {
    host: _host,
    prop: prop
  }
}

watch.get = function(exp, scope) {
  var computer = this.computed[exp]
  if (computer) return computer.value

  var target = scope._watchers[exp]
  return target.host[target.prop]
}

watch.set = function(exp, value, scope) {
  var target = scope._watchers[exp]
  target.host[target.prop] = value
}

watch.addDeps = function(exp, fn, scope) {
  var computer = this.computed[exp]
  if (computer) {
    this.computed._deps[exp].push(fn)
    return
  }

  var target = scope._watchers[exp]
  target.host._deps[target.prop].push(fn)
}

module.exports = watch