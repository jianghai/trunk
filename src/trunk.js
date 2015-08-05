var $ = require('jquery')
var Model = require('./Model')
var View = require('./View')
var Collection = require('./Collection')
var Router = require('./Router')
var extend = require('./extend')


var Trunk = View

Trunk.Model = Model
Trunk.Collection = Collection
Trunk.Router = Router

Trunk.extend = Trunk.Model.extend = Trunk.Collection.extend = Trunk.Router.extend = extend

module.exports = Trunk