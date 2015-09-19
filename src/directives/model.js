
var inputHandles = {

  text: function(element, exp, scope) {
    var self = this
    element.value = this.get(exp, scope)
    element.addEventListener('input', function() {
      self.set(exp, this.value, scope)
    })
    this.addDeps(exp, function(value) {
      element.value === value || (element.value = value)
    }, scope)
  },

  checkbox: function(element, exp, scope) {
    var self = this
    element.checked = this.get(exp, scope)
    element.addEventListener('change', function() {
      self.set(exp, this.checked, scope)
    })
    this.addDeps(exp, function(value) {
      element.checked === value || (element.checked = value)
    }, scope)
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
  modelHandles[element.tagName.toLowerCase()].apply(this, arguments)
}