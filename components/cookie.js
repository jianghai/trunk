define(function() {
  return {
    set: function(name, value, expire, option) {

      option || (option = {});

      option.path || (option.path = '/');

      var cookie = name + '=' + encodeURIComponent(value);
      if (expire) {
        // Use old property expires compatible with IE.
        // If use max-age, just code ';max-age=' + expire.
        var d = new Date();
        d.setTime(d.getTime() + expire * 1000);
        expire = d.toGMTString();
        cookie += ';expires=' + expire;
      }
      for (var i in option) {
        cookie += ';' + i + '=' + option[i];
      }
      document.cookie = cookie;
    },
    get: function(name) {
      // Get cookie.
      var all = document.cookie.split('; ');
      for (var i = 0, len = all.length; i < len; i++) {
        var cookie = all[i].split('=');
        if (cookie[0] === name) {
          return decodeURIComponent(cookie[1]);
        }
      }
    },
    remove: function(name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  };
})