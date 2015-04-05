define(function() {
  return function(name, value, expire, option) {
    var args = arguments;
    var cookie;
    if (value != undefined) {
      // Set cookie.
      // Use encodeURIComponent to escape semicolon, comma and whitespace.
      cookie = name + '=' + encodeURIComponent(value);
      if (expire) {
        // Use old property expires compatible with IE.
        // If use max-age, just code ';max-age=' + expire.
        var d = new Date();
        d.setTime(d.getTime() + expire * 1000);
        expire = d.toGMTString();
        cookie += ';expires=' + expire;
      }
      if (option) {
        for (var i in option) {
          cookie += ';' + i + '=' + option[i];
        }
      }
      document.cookie = cookie;
    } else if (args.length === 1) {
      // Get cookie.
      var all = document.cookie.split('; ');
      for (var i = 0, len = all.length; i < len; i++) {
        var cookie = all[i].split('=');
        if (cookie[0] === name) {
          return decodeURIComponent(cookie[1]);
        }
      }
    } else {
      // Delete cookie.
      this.cookie(name, 1, -1);
    }
  }
})