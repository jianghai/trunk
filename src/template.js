/**
 * 基于字符串的模版，转换模版字符串成一个可执行的函数，视图中传入template选择器自动获取、编译
 * ```js
 * var template = Trunk.template('<button><#- data.content #></button>')
 * console.log(template({content: 'click me'})) // <button>click me</button>
 * ```
 * 语法：<#- 表达式 #>；<# 语句 #>
 * @namespace Trunk
 * @module
 * @param {String} str 模版字符串
 * @return {Function} 传入数据即可返回渲染后的字符串
 */
function template(str) {
  if (!str) return
  str = "var out = '" + str.replace(/\s*\n\s*/g, '') + "'"
  str = str.replace(getReg.statement(), "';$1;out+='")
  str = str.replace(getReg.express(), "'+($1)+'")
  str += ";return out;"
  return new Function(template.global, str)
}

// 规则map
var regRules = {
  statement: '\\s([\\s\\S]+?)', // Inertia match
  express: '-\\s([\\s\\S]+?)'
}

var getReg = {}

for (var i in regRules) {
  (function(i) {
    getReg[i] = function() {
      var _reg = new RegExp(template.leftTag + regRules[i] + template.rightTag, 'g')
      getReg[i] = function() {
        return _reg
      }
      return _reg
    }
  })(i)
}

/**
 * 模版中数据根命名空间，默认'data'，可自定义
 * @name global
 * @type {String}
 */
template.global = 'data'

/**
 * 模版中左分隔符，默认'<#'，可自定义
 * @name leftTag
 * @type {String}
 */
template.leftTag = '<#'

/**
 * 模版中右分隔符，默认'#>'，可自定义
 * @name rightTag
 * @type {String}
 */
template.rightTag = '#>'

module.exports = template