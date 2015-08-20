define([
  'jquery',
  'Trunk'
], function($, Trunk) {

  var View = Trunk.extend({

    el: '#tree',

    template: '.template-tree',

    events: {
      'click .toggle': 'onToggle'
    },

    onToggle: function(e) {
      $(e.target).parent().toggleClass('close')
    }
  })

  View.Model = Trunk.Model.extend({

  })

  return View
})