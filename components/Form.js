define([
  'jquery',
  'trunk',
  'jquery.extend'
], function($, Trunk) {
  
  var Model = Trunk.Model.extend({
    validate: function(data) {
      this.error = {};
      var isValid = true;
      for (var i in data) {
        if (this.rules[i]) {
          var msg = this.rules[i](data[i]);
          if (msg) {
            this.error[i] = msg;
            isValid = false;
            break;
          }
        }
      }
      return isValid;
    }
  });

  return Trunk.View.extend({
    Model: Model,
    events: {
      'submit': 'onSubmit'
    },
    onValidate: function() {
      this.$('.error').removeClass('error');
    },
    onInvalid: function() {
      var error = this.model.error;
      for (var k in error) {
        this.$('.' + k).addClass('error').find('.error-tip').text(error[k]);
      }
    },
    onSubmit: function() {
      var data = this.el.serializeObject();
      if (this.model.set(data)) {
        $.ajax({
          type: 'post',
          url: this.model.url,
          data: $.jsonParam(this.model.data)
        }).done(this.onDone.bind(this));
      }
      return false;
    }
  });
});