var app = new Trunk.View({
  modelProperty: {
    url: 'aa'
  },

  el: '#aa',

  aa: 2,

  init: function() {
    this.model.fetch();
    this.model.on('aa', function() {
      console.log(1);
    });
  }
});

var app2 = new Trunk.View({
  modelProperty: {
    url: 'bb'
  },

  el: '#bb',

  bb: 1,

  init: function() {
    this.model.fetch();
  }
});