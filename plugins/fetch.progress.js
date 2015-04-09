/**
 * This is only one example of fetch progress.
 */
(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    // AMD module
    define(['jquery', 'vjs', 'trunk'], function($, vjs, Trunk) {
      return factory(root, $, vjs, Trunk)
    });
  } else {
    factory(root, jQuery, vjs, Trunk);
  }
})(window, function(win, $, vjs, Trunk) {

  // Loading
  Trunk.View.prototype.onRequest = function() {
    this.el.html('loading...');
  }

  // No Data
  Trunk.View.prototype.onEmpty = function() {
    this.el.html('No data');
  }

  // Error
  Trunk.View.prototype.onError = function() {
    this.el.html('Server error');
  }
});