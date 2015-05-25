define([
  'jquery',
  'trunk',
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
    serialize: function() {
      var res = {};
      this.el.serializeArray().forEach(function(field) {
        if (field.name in res) {
          Array.isArray(res[field.name]) && (res[field.name] = [res[field.name]]);
          res[field.name].push(field.value);
        } else {
          res[field.name] = field.value;
        }
      });
      return res;
    },
    onSubmit: function() {
      if (this.model.set(this.serialize())) {
        $.ajax({
          type: 'post',
          url: this.model.post,
          data: $.jsonParam(this.model.data)
        }).done(this.onDone.bind(this));
      }
      return false;
    }
  });
});