exports.setParam = function(param, silent) {

  this.param || (this.param = {});

  if (typeof param === 'string') {
    var _key = param;
    param = {};
    param[_key] = silent;
    silent = arguments[2];
  }

  for (var k in param) {
    var val = param[k];
    if (val || val === 0) {
      this.param[k] = val;
    } else {
      delete this.param[k];
    }
  }

  !silent && this.fetch();
}

exports.onDone = function(res) {
  this.trigger('sync', res);
  this.onFetch(res);
}

exports.fetch = function() {
  var self = this;
  this.trigger('request');
  $.ajax({
    url: this.url,
    data: this.param
  }).done(this.onDone.bind(this));
}