(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
    el_body: null,
    el_metaViewport: null,
    el_container: null,
    el_overlay: null,

    bln_isTouchDevice: false,

    str_originalViewportSettings: '',
    str_zoomImageUrl: '',

	start: function() {
        this.check_isTouchDevice()
	    this.determineGivenElements();
        this.determineZoomImage();
        this.initializeZoomStartEvent();

        console.log(this.str_zoomImageUrl);
	},

    determineGivenElements: function() {
        this.el_body = $$('body')[0];
        this.el_metaViewport = $$('meta[name=viewport]');
        this.str_originalViewportSettings = this.el_metaViewport.getProperty('content');
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

    insertOverlay: function() {
        this.el_overlay = new Element('div.lsjs-zoomer-overlay');
        this.el_overlay.setStyles({
            'background-image': 'url("' + this.str_zoomImageUrl + '")',
        });
        this.el_overlay.addEvent(
            'click',
            this.zoomEnd.bind(this)
        );
        this.el_body.adopt(this.el_overlay);
        this.el_body.addClass('lsjs-image-zoomer-open');
        this.el_metaViewport.setProperty('content', 'width=device-width, initial-scale=1.0, minimum-scale=0.2, maximum-scale=3.0, user-scalable=1');
    },

    removeOverlay: function() {
        this.el_metaViewport.setProperty('content', this.str_originalViewportSettings);
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