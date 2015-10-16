var Repeat = require('../class/Repeat')

module.exports = function(element, exp, scope) {
  new Repeat(element, exp, scope, this)
  return false
}