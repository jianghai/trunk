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
          var msg = this.rules[i].call(this, data[i]);
          if (msg) {
            this.error[i] = msg;
            isValid = false;
            // break;
          }
        }
      }
      return isValid;
    }
  });

  return Trunk.View.extend({

    Model: Model,

    events: {
      'submit': 'onSubmit',
      'change input[type="text"]': 'onChange',
      'change input[type="file"]': 'onFileChange',
      'change input[type="checkbox"]': 'onCheckboxChange',
      'change textarea': 'onChange',
      'change select': 'onChange',
    },

    onChange: function(e) {
      var target = e.target;
      target.name && this.model.set(target.name, target.value);
    },

    onFileChange: function(e) {
      var target = e.target;
      target.name && this.model.set(target.name, target.files[0]);
    },

    onCheckboxChange: function(e) {
      var target = e.target;
      if (!target.name) return;
      
      var checked = target.checked;
      var data = this.model[target.name];
      if (!data) {
        data = [];
      }
      if (checked) {
        data.push(target.value);
      } else {
        data.splice(data.indexOf(target.value), 1);
      }
      this.model.set(target.name, data);
    },

    onValidate: function(data) {
      for (var k in data) {
        this.$('.' + k)
          .removeClass('error')
          .addClass('success')
          .find('.tip')
          .text('ok');
      }
    },

    onInvalid: function() {
      var error = this.model.error;
      for (var k in error) {
        this.$('.' + k).removeClass('success').addClass('error').find('.tip').text(error[k]);
      }
    },

    serialize: function() {
      var res = {};
      this.$('[name]').each(function(i, el) {
        if (el.type === 'file') {
          res[el.name] = el.files[0];
        } else if (el.type === 'checkbox') {
          if (!res[el.name]) res[el.name] = [];
          el.checked && res[el.name].push(el.value);
        } else {
          res[el.name] = el.value;
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
    },

    init: function() {
      this.listen(this.model, 'validate', this.onValidate);
      this.listen(this.model, 'invalid', this.onInvalid);
    }
  });
});