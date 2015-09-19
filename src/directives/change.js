var _ = require('../util')

module.exports = function(element, method, scope) {
  _.on(element, 'change', method, scope, this)
}