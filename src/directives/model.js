var watch = require('../watch')

var inputHandles = {

  text: function(element, exp, scope) {
    element.value = watch.get.call(this, exp, scope) || ''
    element.addEventListener('input', function() {
      watch.set(exp, this.value, scope)
    })
    watch.addDeps.call(this, exp, function(value) {
      element.value === value || (element.value = value)
    }, scope)
  },

  checkbox: function(element, exp, scope) {
    var that = this
    element.checked = this.get(exp, scope) || false
    element.addEventListener('change', function() {
      that.set(exp, this.checked, scope)
    })
    this.addWatch(exp, scope, function(value) {
      element.checked === value || (element.checked = value)
    })
  }
}

var modelHandles = {

  input: function(element) {
    inputHandles[element.type].apply(this, arguments)
  },
  
  select: function(element, exp) {

  },
  
  textarea: function() {

  }
}

module.exports = function(element, exp, scope) {
  // scope = this.getScope(exp, scope)
  // this.watch(exp, scope)
  modelHandles[element.tagName.toLowerCase()].apply(this, arguments)
}