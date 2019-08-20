(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
    el_body: null,
    el_container: null,
    el_overlay: null,
    el_bigImage: null,
    el_bigImageContainer: null,
    el_btnClose: null,
    el_btnZoomIn: null,
    el_btnZoomOut: null,

    bln_isTouchDevice: false,

    bln_currentlyReinitializing: false,
    int_numReinitializations: 0,
    int_shortReinitializingTimeout: 200,
    int_longReinitializingTimeout: 1000,

    str_originalViewportSettings: '',
    str_zoomImageUrl: '',

    float_currentZoomFactor: .5,
    
    obj_bigImageNaturalSize: {
        width: 0,
        height: 0
    },
    
    obj_overlaySize: {
        width: 0,
        height: 0
    },
    
    obj_proportionalityFactor: {
        x: 1,
        y: 1
    },

    obj_positionOffset: {
        x: 0,
        y: 0
    },
    
	start: function() {
        this.check_isTouchDevice();
	    this.determineGivenElements();
        this.determineZoomImage();
        this.initializeZoomStartEvent();
	},

    determineGivenElements: function() {
        this.el_body = $$('body')[0];
        this.el_container = this.__el_container;
        this.el_container.addClass('lsjs-image-zoomer-applied');
    },

    determineZoomImage: function() {
        if (this.el_container.hasAttribute('rel')) {
            this.str_zoomImageUrl = this.el_container.getProperty('rel');
        } else if (this.el_container.hasAttribute('href')) {
            this.str_zoomImageUrl = this.el_container.getProperty('href');
        } else {
            if (this.__module.__parentModule.__models.options.data.bln_showConsoleWarnings) {
                console.warn('LSJS IMAGE ZOOMER: Element has neither a rel nor a href attribute to read the zoom image url from.');
                console.warn(this.el_container);
            }
        }
    },

    initializeZoomStartEvent: function() {
        this.el_container.addEvent(
            'click',
            this.zoomStart.bind(this)
        )
    },

    zoomStart: function(event) {
        event.preventDefault();
        this.insertOverlay();
    },

    zoomEnd: function(event) {
        this.removeOverlay();
    },

    zoomIn: function() {
        this.float_currentZoomFactor += .1;
        this.setZoomFactor();
    },

    zoomOut: function() {
        this.float_currentZoomFactor -= .1;
        this.setZoomFactor();
    },

    setZoomFactorAndPositionOffset: function() {
        this.el_bigImage.setStyle('transform', 'scale(' + this.float_currentZoomFactor + ') translate3d(' + this.obj_positionOffset.x + 'px, ' + this.obj_positionOffset.y + 'px, 0)');
    },

    insertOverlay: function() {
        lsjs.loadingIndicator.__controller.show();
        this.el_overlay = new Element('div.lsjs-zoomer-overlay');

        this.el_bigImage = new Element('img.big-image').setProperty('src', this.str_zoomImageUrl).addEvent(
            'load',
            this.initializeZoomImageAfterLoad.bind(this)
        );

        this.el_bigImageContainer = new Element('div.big-image-container');

        this.el_btnClose = new Element('div.btn-close');
        this.el_btnClose.addEvent(
            'click',
            this.zoomEnd.bind(this)
        );

        this.el_btnZoomIn = new Element('div.btn-zoom-in');
        this.el_btnZoomIn.addEvent(
            'click',
            this.zoomIn.bind(this)
        );

        this.el_btnZoomOut = new Element('div.btn-zoom-out');
        this.el_btnZoomOut.addEvent(
            'click',
            this.zoomOut.bind(this)
        );

        this.el_body.adopt(
            this.el_overlay.adopt(
                this.el_bigImageContainer.adopt(
                    this.el_bigImage,
                ),
                this.el_btnClose,
                this.el_btnZoomIn,
                this.el_btnZoomOut
            )
        );

        this.el_body.addClass('lsjs-image-zoomer-open');
    },

    initializeZoomImageAfterLoad: function() {
        this.obj_bigImageNaturalSize.width = this.el_bigImage.naturalWidth;
        this.obj_bigImageNaturalSize.height = this.el_bigImage.naturalHeight;
        this.obj_overlaySize.width = this.el_overlay.offsetWidth;
        this.obj_overlaySize.height = this.el_overlay.offsetHeight;

        this.obj_proportionalityFactor.x = this.obj_overlaySize.width / this.obj_bigImageNaturalSize.width;
        this.obj_proportionalityFactor.y = this.obj_overlaySize.height / this.obj_bigImageNaturalSize.height;

        this.float_currentZoomFactor = this.obj_proportionalityFactor.x < this.obj_proportionalityFactor.y ? this.obj_proportionalityFactor.x : this.obj_proportionalityFactor.y;

        this.determineNecessaryOffset();

        this.setZoomFactorAndPositionOffset();
        lsjs.loadingIndicator.__controller.hide();

        this.bln_currentlyReinitializing = false;

        window.addEvent(
            'resize',
            this.reinitializeZoomImage.bind(this)
        );
    },

    reinitializeZoomImage: function() {
        if (this.bln_currentlyReinitializing) {
            return;
        }

        this.int_numReinitializations++;

        this.bln_currentlyReinitializing = true;

        window.setTimeout(
            this.initializeZoomImageAfterLoad.bind(this),
            this.int_numReinitializations < 5 ? this.int_shortReinitializingTimeout : this.int_longReinitializingTimeout
        );
    },

    determineNecessaryOffset: function() {
        var float_bigImageScaledWidth = this.obj_bigImageNaturalSize.width * this.float_currentZoomFactor;
        var float_bigImageScaledHeight = this.obj_bigImageNaturalSize.height * this.float_currentZoomFactor;

        this.obj_positionOffset.x = (((this.obj_bigImageNaturalSize.width - float_bigImageScaledWidth) / 2) - ((this.obj_overlaySize.width - float_bigImageScaledWidth) / 2)) * -1 / this.float_currentZoomFactor;
        this.obj_positionOffset.y = (((this.obj_bigImageNaturalSize.height - float_bigImageScaledHeight) / 2) - ((this.obj_overlaySize.height - float_bigImageScaledHeight) / 2)) * -1 / this.float_currentZoomFactor;
    },

    removeOverlay: function() {
        window.removeEvent(
            'resize',
            this.reinitializeZoomImage.bind(this)
        );

        this.el_body.removeClass('lsjs-image-zoomer-open');
        this.el_overlay.destroy();
        this.el_overlay = null;
    },

    check_isTouchDevice: function() {
        this.bln_isTouchDevice = ('ontouchstart' in document.documentElement);
    }
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();