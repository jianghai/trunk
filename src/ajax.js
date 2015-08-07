var $ = require('jquery')


/**
 * ajax请求交互模块，服务端返回的数据格式必须是JSON，Trunk、Trunk.Model、Trunk.Collection的实例均可调用
 * @module
 */
exports.setParam = function(param, silent) {

  this.param || (this.param = {})

  if (typeof param === 'string') {
    var _key = param
    param = {}
    param[_key] = silent
    silent = arguments[2]
  }

  for (var k in param) {
    var val = param[k]
    if (val || val === 0) {
      this.param[k] = val
    } else {
      delete this.param[k]
    }
  }

  !silent && this.fetch()
}

exports.onDone = function(res) {
  this.trigger('sync', res)
  this.onFetch(res)
}

exports.fetch = function() {
  var self = this
  this.trigger('request')
  $.ajax({
    url: this.url,
    data: this.param
  }).done(this.onDone.bind(this))
}