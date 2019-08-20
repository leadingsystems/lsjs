(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
    el_body: null,
    el_container: null,
    el_overlay: null,
    el_bigImage: null,
    el_btnClose: null,
    el_btnZoomIn: null,
    el_btnZoomOut: null,

    bln_isTouchDevice: false,

    str_originalViewportSettings: '',
    str_zoomImageUrl: '',

    float_currentZoomFactor: .5,

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

    setZoomFactor: function() {
        this.el_bigImage.setStyle('transform', 'scale(' + this.float_currentZoomFactor + ')');
    },

    insertOverlay: function() {
        this.el_overlay = new Element('div.lsjs-zoomer-overlay');

        this.el_bigImage = new Element('img.big-image').setProperty('src', this.str_zoomImageUrl);
        this.setZoomFactor();

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
                this.el_bigImage,
                this.el_btnClose,
                this.el_btnZoomIn,
                this.el_btnZoomOut
            )
        );

        this.el_body.addClass('lsjs-image-zoomer-open');
    },

    removeOverlay: function() {
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