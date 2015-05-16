define([
  'jquery',
  'trunk'
], function($, Trunk) {

  return Trunk.View.extend({

    events: {
      'click .tab-navi': 'onTab'
    },

    onTab: function(e) {
      var target = $(e.currentTarget);
      var index = target.index();
      if (this.index === index) return false;
      this.index = index;
      target.addClass('active').siblings().removeClass('active');
      this.$('.tab-item').removeClass('active').eq(index).addClass('active');
      this.trigger('change', target)
      return false;
    }
  });

  // $('body').on('click', '.tab-navi', function(e) {
  //   var target = $(e.currentTarget);
  //   var index = target.index();
  //   target.addClass('active').siblings().removeClass('active');
  //   target.closest('.tab').find('.tab-item').removeClass('active').eq(index).addClass('active');
  //   return false;
  // });
});