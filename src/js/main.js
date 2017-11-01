/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global jQuery, $, document, Site, Modernizr */

Site = {
  mobileThreshold: 601,
  init: function() {
    var _this = this;

    $(window).resize(function(){
      _this.onResize();
    });

    _this.Header.init();

    if ($('body').hasClass('template-product')) {
      _this.Product.init();
    }

  },

  onResize: function() {
    var _this = this;

    if ($('#product-gallery').length) {
      _this.Product.bindFixedHeader();
    }
  },

  fixWidows: function() {
    // utility class mainly for use on headines to avoid widows [single words on a new line]
    $('.js-fix-widows').each(function(){
      var string = $(this).html();
      string = string.replace(/ ([^ ]*)$/,'&nbsp;$1');
      $(this).html(string);
    });
  },


};

Site.Header = {
  init: function() {
    var _this = this;

    _this.bindCollectionHover();

    _this.bindMobileToggle();
  },

  bindCollectionHover: function() {
    var _this = this;

    $('.nav-collection').on('mouseenter', function() {
      var collection = $(this).attr('data-collection');

      _this.hideTypes();
      _this.showTypes(collection);
    });

    $('#main-nav').on('mouseleave', function() {

      _this.hideTypes();
    });
  },

  showTypes: function(collection) {
    $('.nav-collection[data-collection="' + collection + '"]').addClass('active');
    $('.nav-types[data-collection="' + collection + '"]').addClass('show');
  },

  hideTypes: function(collection) {
    $('.nav-collection.active').addClass('active');
    $('.nav-types.show').removeClass('show');
  },

  bindMobileToggle: function() {
    $('.js-menu-toggle').on('click', function() {
      $('#mobile-nav').toggleClass('show');
    });
  },
};

Site.Product = {
  minWidth: 720,
  init: function() {
    var _this = this;

    _this.$productHeader = $('#product-header');
    _this.$productGallery = $('#product-gallery');

    if (_this.$productGallery.length) {
      _this.bindFixedHeader();
    }

    if ($('#related-products').length) {
      _this.pickRelated();
    }
  },

  bindFixedHeader: function() {
    var _this = this;

    var windowWidth = $(window).width();

    if (windowWidth >= _this.minWidth) {
      _this.galleryHeight = _this.$productGallery.outerHeight(true);
      _this.galleryOffset = _this.$productGallery.offset().top;
      _this.headerHeight = _this.$productHeader.outerHeight(true);
      _this.headerOffset = _this.$productHeader.offset().top;

      _this.toggleFixed();

      $(window).on('scroll', function() {
        _this.toggleFixed();
      });
    } else {
      $(window).off('scroll');
    }
  },

  toggleFixed: function() {
    var _this = this;

    var windowScroll = $(window).scrollTop();

    if ((windowScroll + _this.galleryOffset + _this.headerHeight) <= (_this.galleryHeight + _this.galleryOffset)) {
      _this.$productHeader.addClass('fixed');
      _this.$productHeader.css('margin-top', 0);
    } else {
      _this.$productHeader.removeClass('fixed');
      _this.$productHeader.css('margin-top', (_this.galleryHeight - _this.headerHeight) + 'px');
    }
  },

  pickRelated: function() {
    $('.related-products-item').pick(4);

    $('#related-products').removeClass('u-hidden');
  },
}

jQuery(document).ready(function () {
  'use strict';

  Site.init();

});
