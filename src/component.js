
function component(name, options) {

  options.el = document.querySelector(options.template).content.firstElementChild

  this.prototype.components[name] = new this(options)
}

module.exports = component