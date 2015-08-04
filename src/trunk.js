var Model = require('./Model.js')
var View = require('./View.js')
var Collection = require('./Collection.js')
var Router = require('./Router.js')
var extend = require('./extend.js')


var Trunk = {}

Trunk.Model = Model
Trunk.Collection = Collection
Trunk.View = View
Trunk.Router = Router

Trunk.Model.extend = Trunk.Collection.extend = Trunk.View.extend = Trunk.Router.extend = extend

module.exports = Trunk