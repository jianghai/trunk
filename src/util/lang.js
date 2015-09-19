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

exports.initialize = function(obj, key, value) {
  obj[key] || Object.defineProperty(obj, key, {
    value: value
  })
}

exports.mapParse = function(map, callback, context) {
  map.split(',').forEach(function(item) {
    item = item.trim().split(':')
    callback.call(this, item[0], item[1].trim())
  }, context)
}