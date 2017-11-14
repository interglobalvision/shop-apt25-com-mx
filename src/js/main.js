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
      _this.Product.handleLayout();
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

    _this.$zoomContainer = $('#zoom-container');

    _this.loadedImages = false;

    if (_this.$productGallery.length) {
      _this.handleLayout();
    }

    if ($('#related-products').length) {
      _this.pickRelated();
    }
  },

  handleLayout: function() {
    var _this = this;

    _this.$container = $('.container');

    _this.windowWidth = $(window).width();

    if (_this.windowWidth >= _this.minWidth) {

      if (!_this.loadedImages) {
        _this.$productGallery.imagesLoaded( function() {
          _this.$productGallery.removeClass('min-height');
          _this.sizeImageHolder();
          _this.getFixedHeaderDimensions();
          _this.toggleFixed();
          _this.bindZoom();
          _this.loadedImages = true;
        });
      } else {
        _this.sizeImageHolder();
        _this.getFixedHeaderDimensions();
        _this.toggleFixed();
        _this.bindZoom();
      }

      $(window).on('scroll', function() {
        _this.toggleFixed();
      });

    } else {

      _this.$productGallery.removeClass('min-height');
      $('.product-gallery-image-holder').width('auto').height('auto');
      _this.getFixedHeaderDimensions();
      _this.toggleFixed();
      _this.destroyZoom();

      $(window).off('scroll');

    }
  },

  getFixedHeaderDimensions: function() {
    var _this = this;

    _this.galleryHeight = _this.$productGallery.outerHeight(true);
    _this.galleryOffset = _this.$productGallery.offset().top;
    _this.headerHeight = _this.$productHeader.outerHeight(true);
  },

  toggleFixed: function() {
    var _this = this;

    var windowScroll = $(window).scrollTop();

    var containerWidth = _this.$container.width();

    if ((windowScroll + _this.galleryOffset + _this.headerHeight) <= (_this.galleryHeight + _this.galleryOffset)) {
      _this.$productHeader.removeClass('bottom');
      _this.$productHeader.css('margin-right', ((_this.windowWidth - containerWidth) / 2) + 'px');
    } else {
      _this.$productHeader.addClass('bottom');
      _this.$productHeader.css('margin-right', 0);
    }
  },

  pickRelated: function() {
    $('.related-products-item').pick(4);

    $('#related-products').removeClass('u-hidden');
  },

  sizeImageHolder: function() {
    $('.product-gallery-image-holder').each(function() {
      $(this).height('auto').width('auto');

      var $imgElem = $(this).find('.product-gallery-image');
        imgHeight = $imgElem.height(),
        imgWidth = $imgElem.width();

      $(this).height(imgHeight).width(imgWidth);
    });
  },

  bindZoom: function() {
    var _this = this;

    $('.product-gallery-image-holder').each(function(){
      // Each image in gallery

      var $zoomContainer = $(this).children('.zoom-container');

      var imgWidth = $(this).width();
      var imgOffset = $(this).offset();

      var zoomMagnitude = 1.5;

      var zoomWidth = imgWidth * (zoomMagnitude * 2);
      var zoomLeft = (imgOffset.left - ((zoomWidth - imgWidth) / 2));

      // Center zoom container on image
      $zoomContainer.css({
        'width': zoomWidth + 'px',
        'left': zoomLeft + 'px',
      });

      // Zoom
      $(this).zoom({
        target: $zoomContainer,
        on: 'grab',
        onZoomIn: function() {
          $(this).parent('.zoom-container').addClass('show');
        },
        onZoomOut: function() {
          $(this).parent('.zoom-container').removeClass('show');
        },
        magnify: zoomMagnitude,
      });

    });
  },

  destroyZoom: function() {
    $('.product-gallery-image-holder').trigger('zoom.destroy');
  },
}

jQuery(document).ready(function () {
  'use strict';

  Site.init();

});
