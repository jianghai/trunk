var $ = require('jquery')

/**
 * 工具函数
 */
exports.isPlainObject = function(obj) {
  return obj.constructor === Object
}

exports.isArray = function(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

exports.isFunction = function(fun) {
  return typeof fun === 'function'
}

exports.mergeAttributes = function(attributes) {
  
  if (_.isFunction(attributes.init) && _.isFunction(this.init)) {
    var _this = this.init
    var _init = attributes.init
    attributes.init = function() {
      _this.call(this)
      _init.call(this)
    }
  }

  for (var k in attributes) {
    if (_.isPlainObject(attributes[k]) || _.isArray(attributes[k])) {
      this[k] = $.extend(true, {}, this[k], attributes[k])
    } else {
      this[k] = attributes[k]
    }
  }
}