var $ = require('jquery')


/**
 * ajax请求交互模块，服务端返回的数据格式必须是JSON，
 * Trunk、Trunk.Model、Trunk.Collection的实例均可调用
 * @module
 */


/**
 * 设置GET请求参数，如果参数值为空字符串或null或undefined，则删除当前参数
 * ```js
 * model.setParam({
 *   sort: 'id',
 *   sortType: null // 删除当前字段
 * })
 * ```
 * @name setParam
 * @param {Object|String} param|key 请求参数对象或参数名
 * @param {Boolean|*} [silent]|value 静默模式（默认设置完参数后fetch数据）或参数值
 * @param {Boolean} [silent]
 */
exports.setParam = function(param, silent) {

  /**
   * fetch数据的请求参数对象
   * @name param
   * @type {Object}
   */
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

/**
 * 发送ajax请求，向服务器fetch数据（GET请求）
 * @name fetch
 */
exports.fetch = function() {
  var self = this
  this.trigger('request')
  $.ajax({

    /**
     * fetch数据的URL
     * @name url
     * @type {String}
     */
    url: this.url,
    data: this.param
  }).done(function() {
    self.trigger('sync', res)
    self._onFetch(res)
  })
}