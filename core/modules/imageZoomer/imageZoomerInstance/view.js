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

    float_currentZoomFactor: 1,
    float_minZoomFactor: null,
    float_maxZoomFactor: null,
    float_zoomFactorStep: null,

    obj_bigImageNaturalSize: {
        width: 0,
        height: 0
    },

    obj_imageScaledSize: {
        width: 0,
        height: 0
    },
    
    obj_overlaySize: {
        width: 0,
        height: 0
    },

    obj_stageBoundaries: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    
    obj_proportionalityFactor: {
        x: 1,
        y: 1
    },

    obj_positionOffset: {
        x: 0,
        y: 0
    },

    obj_positionOffsetDragged: {
        x: 0,
        y: 0
    },

    obj_dragData: {
        firstPointerPosition: {
            x: null,
            y: null
        },
        dragStartPosition:  {
            x: null,
            y: null
        },
        dragOffsetPosition: {
            x: 0,
            y: 0
        }
    },
    
	start: function() {
        this.bound_reinitializeZoomImage = this.reinitializeZoomImage.bind(this);

        this.float_minZoomFactor = this.__module.__parentModule.__models.options.data.float_minZoomFactor;
        this.float_maxZoomFactor = this.__module.__parentModule.__models.options.data.float_maxZoomFactor;
        this.float_zoomFactorStep = this.__module.__parentModule.__models.options.data.float_zoomFactorStep;

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
        this.deactivateImageTransitionAnimation();

        this.float_currentZoomFactor = this.float_currentZoomFactor + this.float_zoomFactorStep;
        this.limitZoomFactor();

        this.calculateImageScaledSize();
        this.determineBoundaries();
        this.determineNecessaryOffset();
        this.setZoomFactorAndPositionOffset();
        this.checkImageBoundaries();
    },

    zoomOut: function() {
        this.deactivateImageTransitionAnimation();

        this.float_currentZoomFactor = this.float_currentZoomFactor - this.float_zoomFactorStep;
        this.limitZoomFactor();

        this.calculateImageScaledSize();
        this.determineBoundaries();
        this.determineNecessaryOffset();
        this.setZoomFactorAndPositionOffset();
        this.checkImageBoundaries();
    },

    limitZoomFactor: function() {
        if (this.float_currentZoomFactor > this.float_maxZoomFactor) {
            this.float_currentZoomFactor = this.float_maxZoomFactor;
        } else if (this.float_currentZoomFactor < this.float_minZoomFactor) {
            this.float_currentZoomFactor = this.float_minZoomFactor;
        }

        if (this.float_currentZoomFactor >= this.float_maxZoomFactor) {
            this.el_btnZoomIn.removeClass('possible');
        } else {
            this.el_btnZoomIn.addClass('possible');
        }

        if (this.float_currentZoomFactor <= this.float_minZoomFactor) {
            this.el_btnZoomOut.removeClass('possible');
        } else {
            this.el_btnZoomOut.addClass('possible');
        }
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
                    this.el_bigImage
                ),
                this.el_btnClose,
                this.el_btnZoomIn,
                this.el_btnZoomOut
            )
        );

        this.el_body.addClass('lsjs-image-zoomer-open');

        this.dragInitialize();
    },

    initializeZoomImageAfterLoad: function() {
        this.obj_bigImageNaturalSize.width = this.el_bigImage.naturalWidth;
        this.obj_bigImageNaturalSize.height = this.el_bigImage.naturalHeight;
        this.obj_overlaySize.width = this.el_overlay.offsetWidth;
        this.obj_overlaySize.height = this.el_overlay.offsetHeight;

        this.obj_proportionalityFactor.x = this.obj_overlaySize.width / this.obj_bigImageNaturalSize.width;
        this.obj_proportionalityFactor.y = this.obj_overlaySize.height / this.obj_bigImageNaturalSize.height;

        this.float_currentZoomFactor = this.obj_proportionalityFactor.x < this.obj_proportionalityFactor.y ? this.obj_proportionalityFactor.x : this.obj_proportionalityFactor.y;

        if (this.__module.__parentModule.__models.options.data.float_minZoomFactor === null) {
            this.float_minZoomFactor = this.float_currentZoomFactor < 1 ? this.float_currentZoomFactor : 1;
        }

        this.limitZoomFactor();

        this.calculateImageScaledSize();
        this.determineBoundaries();
        this.determineNecessaryOffset();
        this.setZoomFactorAndPositionOffset();
        this.checkImageBoundaries();
        lsjs.loadingIndicator.__controller.hide();

        this.bln_currentlyReinitializing = false;

        this.float_windowWidth = window.innerWidth;

        window.addEvent(
            'resize',
            this.bound_reinitializeZoomImage
        );
    },

    reinitializeZoomImage: function() {
        if (this.bln_currentlyReinitializing) {
            return;
        }

        /*
         * Only reinitialize if the window's width changed. Changes in height are irrelevant.
         */
        if (this.float_windowWidth === window.innerWidth) {
            return;
        }

        this.int_numReinitializations++;

        this.bln_currentlyReinitializing = true;

        window.setTimeout(
            this.initializeZoomImageAfterLoad.bind(this),
            this.int_numReinitializations < 5 ? this.int_shortReinitializingTimeout : this.int_longReinitializingTimeout
        );
    },

    bound_reinitializeZoomImage: null,

    setZoomFactorAndPositionOffset: function() {
        this.obj_positionOffsetDragged.x = this.obj_positionOffset.x + (this.obj_dragData.dragOffsetPosition.x / this.float_currentZoomFactor);
        this.obj_positionOffsetDragged.y = this.obj_positionOffset.y + (this.obj_dragData.dragOffsetPosition.y / this.float_currentZoomFactor);

        this.el_bigImage.setStyle('transform', 'scale(' + this.float_currentZoomFactor + ') translate3d(' + this.obj_positionOffsetDragged.x + 'px, ' + this.obj_positionOffsetDragged.y + 'px, 0)');
    },

    calculateImageScaledSize: function() {
        this.obj_imageScaledSize.width = this.obj_bigImageNaturalSize.width * this.float_currentZoomFactor;
        this.obj_imageScaledSize.height = this.obj_bigImageNaturalSize.height * this.float_currentZoomFactor;
    },

    determineNecessaryOffset: function() {
        this.obj_positionOffset.x = (((this.obj_bigImageNaturalSize.width - this.obj_imageScaledSize.width) / 2) - ((this.obj_overlaySize.width - this.obj_imageScaledSize.width) / 2)) * -1 / this.float_currentZoomFactor;
        this.obj_positionOffset.y = (((this.obj_bigImageNaturalSize.height - this.obj_imageScaledSize.height) / 2) - ((this.obj_overlaySize.height - this.obj_imageScaledSize.height) / 2)) * -1 / this.float_currentZoomFactor;
    },

    removeOverlay: function() {
        window.removeEvent(
            'resize',
            this.bound_reinitializeZoomImage
        );

        this.el_body.removeClass('lsjs-image-zoomer-open');
        this.el_overlay.destroy();
        this.el_overlay = null;
    },

    check_isTouchDevice: function() {
        this.bln_isTouchDevice = ('ontouchstart' in document.documentElement);
    },

    dragInitialize: function() {
        if (this.bln_isTouchDevice) {
            this.el_bigImage.addEvent(
                'touchstart',
                this.dragStart.bind(this)
            );

            this.el_bigImage.addEvent(
                'touchend',
                this.dragEnd.bind(this)
            );

            this.el_bigImage.addEvent(
                'touchmove',
                this.drag.bind(this)
            );
        } else {
            this.el_bigImage.addEvent(
                'mousedown',
                this.dragStart.bind(this)
            );

            this.el_bigImage.addEvent(
                'mouseup',
                this.dragEnd.bind(this)
            );

            this.el_bigImage.addEvent(
                'mouseleave',
                this.dragEnd.bind(this)
            );

            this.el_bigImage.addEvent(
                'mousemove',
                this.drag.bind(this)
            );
        }
    },

    dragStart: function(event) {
        event.preventDefault();
        this.bln_currentlyDragging = true;
        this.el_bigImage.addClass('dragging');

        this.obj_dragData.firstPointerPosition.x = (event.type === 'touchstart' ? event.event.touches[0].clientX : event.event.clientX);
        this.obj_dragData.dragStartPosition.x = this.obj_dragData.firstPointerPosition.x - this.obj_dragData.dragOffsetPosition.x;

        this.obj_dragData.firstPointerPosition.y = (event.type === 'touchstart' ? event.event.touches[0].clientY : event.event.clientY);
        this.obj_dragData.dragStartPosition.y = this.obj_dragData.firstPointerPosition.y - this.obj_dragData.dragOffsetPosition.y;

        this.deactivateImageTransitionAnimation();
    },

    dragEnd: function(event) {
        if (!this.bln_currentlyDragging) {
            return;
        }

        this.activateImageTransitionAnimation();

        this.el_bigImage.removeClass('dragging');
        this.bln_currentlyDragging = false;
        this.checkImageBoundaries();
    },

    drag: function(event) {
        if (!this.bln_currentlyDragging) {
            return;
        }

        event.preventDefault();

        this.obj_dragData.dragOffsetPosition.x = (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX) - this.obj_dragData.dragStartPosition.x;

        this.obj_dragData.dragOffsetPosition.y = (event.type === 'touchmove' ? event.event.touches[0].clientY : event.event.clientY) - this.obj_dragData.dragStartPosition.y;

        this.setZoomFactorAndPositionOffset();
    },

    determineBoundaries: function() {
        var float_stageLeft = (this.obj_bigImageNaturalSize.width - this.obj_imageScaledSize.width) / 2;
        var float_stageRight = float_stageLeft - this.obj_overlaySize.width;
        var float_stageLeftRelative = float_stageLeft / this.float_currentZoomFactor * -1;
        var float_stageRightRelative = float_stageRight / this.float_currentZoomFactor * -1;

        this.obj_stageBoundaries.left = float_stageLeftRelative;
        this.obj_stageBoundaries.right = float_stageRightRelative;

        var float_stageTop = (this.obj_bigImageNaturalSize.height - this.obj_imageScaledSize.height) / 2;
        var float_stageBottom = float_stageTop - this.obj_overlaySize.height;
        var float_stageTopRelative = float_stageTop / this.float_currentZoomFactor * -1;
        var float_stageBottomRelative = float_stageBottom / this.float_currentZoomFactor * -1;

        this.obj_stageBoundaries.top = float_stageTopRelative;
        this.obj_stageBoundaries.bottom = float_stageBottomRelative;
    },

    checkImageBoundaries: function() {
        var bln_needToReposition = false;

        var float_imageLeft = this.obj_positionOffsetDragged.x;
        var float_imageRight = this.obj_positionOffsetDragged.x + this.obj_bigImageNaturalSize.width;
        var float_imageTop = this.obj_positionOffsetDragged.y;
        var float_imageBottom = this.obj_positionOffsetDragged.y + this.obj_bigImageNaturalSize.height;

        var str_imageStatusLeftEdge = float_imageLeft >= this.obj_stageBoundaries.left ? 'inside' : 'outside';
        var str_imageStatusRightEdge = float_imageRight <= this.obj_stageBoundaries.right ? 'inside' : 'outside';
        var str_imageStatusTopEdge = float_imageTop >= this.obj_stageBoundaries.top ? 'inside' : 'outside';
        var str_imageStatusBottomEdge = float_imageBottom <= this.obj_stageBoundaries.bottom ? 'inside' : 'outside';

        var float_imageLeftEdgeInsideOffset = float_imageLeft - this.obj_stageBoundaries.left;
        var float_imageRightEdgeInsideOffset = float_imageRight - this.obj_stageBoundaries.right;
        var float_imageTopEdgeInsideOffset = float_imageTop - this.obj_stageBoundaries.top;
        var float_imageBottomEdgeInsideOffset = float_imageBottom - this.obj_stageBoundaries.bottom;

        if (
            this.obj_imageScaledSize.width < this.obj_overlaySize.width
        ) {
            this.obj_dragData.dragOffsetPosition.x = 0;
            bln_needToReposition = true;
        } else if (str_imageStatusLeftEdge === 'inside') {
            this.obj_dragData.dragOffsetPosition.x = this.obj_dragData.dragOffsetPosition.x - float_imageLeftEdgeInsideOffset * this.float_currentZoomFactor;
            bln_needToReposition = true;
        } else if (str_imageStatusRightEdge === 'inside') {
            this.obj_dragData.dragOffsetPosition.x = this.obj_dragData.dragOffsetPosition.x - float_imageRightEdgeInsideOffset * this.float_currentZoomFactor;
            bln_needToReposition = true;
        }


        if (
            this.obj_imageScaledSize.height < this.obj_overlaySize.height
        ) {
            this.obj_dragData.dragOffsetPosition.y = 0;
            bln_needToReposition = true;
        } else if (str_imageStatusTopEdge === 'inside') {
            this.obj_dragData.dragOffsetPosition.y = this.obj_dragData.dragOffsetPosition.y - float_imageTopEdgeInsideOffset * this.float_currentZoomFactor;
            bln_needToReposition = true;
        } else if (str_imageStatusBottomEdge === 'inside') {
            this.obj_dragData.dragOffsetPosition.y = this.obj_dragData.dragOffsetPosition.y - float_imageBottomEdgeInsideOffset * this.float_currentZoomFactor;
            bln_needToReposition = true;
        }

        if (bln_needToReposition) {
            this.setZoomFactorAndPositionOffset();
        }
    },

    activateImageTransitionAnimation: function() {
        this.el_bigImage.setStyle('transition', 'all .25s ease 0s');
    },

    deactivateImageTransitionAnimation: function() {
        this.el_bigImage.setStyle('transition', 'none');
    }
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();