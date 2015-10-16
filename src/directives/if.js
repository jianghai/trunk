var _ = require('../util')
var config = require('../config')

module.exports = function(element, condition, scope) {

  var self = this
  
  this.addDeps(condition, function(value) {
    if (!!lastValue === !!value) return
    if (!value) {
      _.remove(element)
    } else {

      if (!initValue) {
        self.compileNode(element, scope)
      }
      parentNode.insertBefore(element, nextNode)
    }
    lastValue = value
  }, scope)

  // Prevent recompile
  element.removeAttribute(config.d_prefix + 'if')

  var nextNode = element.nextNode
  var parentNode = element.parentNode
  var lastValue = this.get(condition, scope)
  var initValue = lastValue

  if (!lastValue) {
    _.remove(element)
  }

  return !!lastValue
}