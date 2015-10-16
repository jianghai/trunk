var _ = require('../util')

module.exports = function(element, exp, scope) {
  this[exp] = this.parent[exp]
  this.observe()
}