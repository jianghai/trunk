exports.toArray = function(arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0)
}

exports.merge = function(host, extend) {
  for (var k in extend) {
    extend.hasOwnProperty(k) && (host[k] = extend[k])
  }
}

exports.isArray = function(array) {
  return Object.prototype.toString.call(array) === '[object Array]'
}

exports.isObject = function(obj) {
  return typeof obj === 'object' && obj !== null
}

exports.bind = function(fn, context) {
  return function() {
    return fn.apply(context, arguments)
  }
}

exports.initialize = function(host, value) {
  var args = arguments
  var len = args.length - 1
  var lastProp = args[len]
  for (var i = 2; i < len; i++) {
    var prop = args[i]
    host[prop] || Object.defineProperty(host, prop, {
      value: {}
    })
    host = host[prop]
  }
  lastProp in host || (host[lastProp] = value)
  return host[lastProp]
}

exports.mapParse = function(map, callback, context) {
  map.split(',').forEach(function(item) {
    item = item.trim().split(':')
    callback.call(this, item[0], item[1].trim())
  }, context)
}