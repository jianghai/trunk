function component(name, options) {

  options._el = document.querySelector(options.template).content.firstElementChild

  this.prototype.components[name] = options
}

module.exports = component