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
    _this.BlogImages.init();

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

    $('#header .nav-collection').on('mouseenter', function() {
      var collection = $(this).attr('data-collection');

      _this.hideTypes();
      _this.showTypes(collection);
    });

    $('#main-nav').on('mouseleave', function() {

      _this.hideTypes();
    });

    $('.nav-item').on('mouseenter', function() {

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
  minWidth: 720, // minWidth for fixed header layout
  numberRelatedToPick: 4, // number of related products to show
  zoomMagnitude: 1.5, // how much are we zooming?
  init: function() {
    var _this = this;

    _this.$container = $('#product-container'); // used by toggleFixed() on scroll

    _this.$productHeader = $('#product-header');
    _this.$productGallery = $('#product-gallery');

    // imagesLoaded hasn't finished yet
    _this.loadedImages = false;

    if (_this.$productGallery.length) {
      // We have product images, so we do the fancy layout
      _this.handleLayout();

      _this.$productImage = $('.product-gallery-image');
    }

    if ($('#related-products').length) {
      // Pick a few Related Products to display
      _this.pickRelated();
    }
  },

  handleLayout: function() {
    var _this = this;

    _this.windowWidth = $(window).width();

    if (_this.windowWidth >= _this.minWidth) {
      // window is wider than minimum width (720px) for fixed header layout

      _this.containerWidth = _this.$container.width();

      if (!_this.loadedImages) {
        // bind imagesLoaded
        _this.$productGallery.imagesLoaded( function() {
          // images are loaded
          _this.loadedImages = true;

          // remove min-height for product gallery holder
          _this.$productGallery.removeClass('min-height');
          // size image holder to fit image size
          _this.sizeImageHolder();
          // get dimensions for toggleFixed()
          _this.getFixedHeaderDimensions();
          // toggle fixed header
          _this.toggleFixed();
          // init product image zooming
          _this.bindZoom();

          // show product header if still hidden
          if (!_this.$productHeader.hasClass('show')) {
            _this.$productHeader.addClass('show');
          }
        });
      } else {
        // on window resize
        // if images are already loaded
        // do the layout again
        _this.sizeImageHolder();
        _this.getFixedHeaderDimensions();
        _this.toggleFixed();
        _this.bindZoom();
      }

      $(window).on('scroll', function() {
        // toggle fixed header on scroll
        _this.toggleFixed();
      });

    } else {
      // viewport is mobile width

      // remove min-height for product gallery holder
      _this.$productGallery.removeClass('min-height');
      // remove fixed product header margin
      _this.$productHeader.css('margin-right', 0);
      // reset image holder dimensions
      $('.product-gallery-image-holder').width('auto').height('auto');
      // unbind zooming
      _this.destroyZoom();
      // unbind toggleFixed() on scroll
      $(window).off('scroll');
    }
  },

  getFixedHeaderDimensions: function() {
    var _this = this;

    // get gallery and header dimensions for
    // toggling / positioning fixed header

    _this.galleryHeight = _this.$productGallery.outerHeight(true);
    _this.galleryOffset = _this.$productGallery.offset().top;
    _this.headerHeight = _this.$productHeader.outerHeight(true);
  },

  toggleFixed: function() {
    var _this = this;

    var windowScroll = $(window).scrollTop();

    if ((windowScroll + _this.galleryOffset + _this.headerHeight) <= (_this.galleryHeight + _this.galleryOffset)) {
      // fixed header isn't at the bottom of the product gallery holder yet

      // keep header fixed
      _this.$productHeader.removeClass('bottom');
      // position fixed header
      _this.$productHeader.css('margin-right', ((_this.windowWidth - _this.containerWidth) / 2) + 'px');
    } else {
      // fixed header is at the bottom of the product gallery

      // position header absolute
      _this.$productHeader.addClass('bottom');
      // reset fixed header positioning
      _this.$productHeader.css('margin-right', 0);
    }
  },

  pickRelated: function() {
    var _this = this;

    // show some related product items
    $('.related-products-item').pick(_this.numberRelatedToPick);
    // show related products container
    $('#related-products').removeClass('u-hidden');
  },

  sizeImageHolder: function() {
    // size each image holder to fit image

    $('.product-gallery-image-holder').each(function() {
      // clear holder height and width
      $(this).height('auto').width('auto');

      // get image dimensions
      var $imgElem = $(this).find('.product-gallery-image'),
        imgHeight = $imgElem.height(),
        imgWidth = $imgElem.width();

      // apply image dimensions to holder
      $(this).height(imgHeight).width(imgWidth);
    });
  },

  bindZoom: function() {
    var _this = this;

    $('.product-gallery-image-holder').each(function(){
      // Each image in gallery

      // each image holder has a zoom container element
      var $zoomContainer = $(this).children('.zoom-container');

      var imgWidth = $(this).width();
      var imgOffset = $(this).offset();

      var zoomImgUrl = $(this).attr('data-zoom');

      // zoom container positioning magic DO NOT fuck with (*blessings*)
      var zoomWidth = imgWidth * (_this.zoomMagnitude * 2);
      var zoomLeft = (imgOffset.left - ((zoomWidth - imgWidth) / 2));

      // Center zoom container on image
      $zoomContainer.css({
        'width': zoomWidth + 'px',
        'left': zoomLeft + 'px',
      });

      // Bind zooming
      $(this).zoom({
        target: $zoomContainer,
        on: 'grab',
        url: zoomImgUrl,
        onZoomIn: function() {
          $(this).parent('.zoom-container').addClass('show');
          _this.$productImage.addClass('hide');
        },
        onZoomOut: function() {
          $(this).parent('.zoom-container').removeClass('show');
          _this.$productImage.removeClass('hide');
        },
      });

    });
  },

  destroyZoom: function() {
    // unbind zooming
    $('.product-gallery-image-holder').trigger('zoom.destroy');
  }
}

Site.BlogImages = {
  sizes: [
    0,
    'basic',
    'mid',
    'large',
  ],

  init: function() {
    var _this = this;

    _this.$images = $('.lookbook-image');

    // Check if in single
    if(_this.$images.length) {

      _this.$images.each(function() {
        var $image = $(this);
        // Check if image is already loaded

        if ($image.prop('complete')) {
          _this.arrangeImage(this);
        } else {
          // Bind load image
          $image.bind('load', function() {
            _this.arrangeImage(this);
          });
        }
      });
    }
  },

  arrangeImage: function(image) {
    var _this = this;

    var $image = $(image);
    var $parent = $(image).parent();

    // Check image aspect
    if (image.width > image.height) { // Landspcape
      var rand = _this.getRandomInt(1,3);

      if(rand) {
        $image.addClass('padding-left-' + _this.sizes[rand]);
      }

      $parent.removeClass('item-m-6');

    } else { // Portrait
      var rand = _this.getRandomInt(0,3);

      if(rand) {
        $image.addClass('padding-top-' + _this.sizes[rand]);
      }

    }

    $image.addClass('show-image');
  },

  getRandomInt: function(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
}

jQuery(document).ready(function () {
  'use strict';

  Site.init();

});
