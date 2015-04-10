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

  Trunk.View.prototype.template_loading = $('#template-loading').html();
  Trunk.View.prototype.template_error = $('#template-error').html();
  Trunk.View.prototype.template_noData = $('#template-noData').html();

  // Loading
  Trunk.View.prototype.onRequest = function() {
    this.el.html(this.template_loading);
  }

  // No Data
  Trunk.View.prototype.onEmpty = function() {
    this.el.html(this.template_noData);
  }

  // Error
  Trunk.View.prototype.onError = function() {
    this.el.html(this.template_error);
  }
});