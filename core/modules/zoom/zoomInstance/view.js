(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_zoomImage: null,
	el_zoomImageWrapper: null,
	el_zoomBigBox: null,
	el_zoomedImage: null,
	el_zoomAreaMarker: null,
	el_zoomedImagePreloader: null,
	
	obj_zoomImageSize: null,
	obj_zoomImagePosition: null,
	
	obj_zoomedImageSize: null,
	
	int_zoomAreaMarkerWidth: 0,
	int_zoomAreaMarkerHeight: 0,
	obj_zoomAreaMarkerBorderSize: null,
	
	int_zoomAreaMarkerTop: 0,
	int_zoomAreaMarkerLeft: 0,

	start: function() {
		if (typeOf(this.__module.__parentModule.__models.options.data.func_beforeInit) === 'function') {
			this.__module.__parentModule.__models.options.data.func_beforeInit(this);
		}
		
		this.el_zoomImage = this.__module.obj_args.el_zoomImage;
		this.el_zoomImage.addClass('zoomImage');

		window.addEvent('resize', this.startZoomer.bind(this));
				
		this.el_zoomImageWrapper = new Element('span.lsZoomImageWrapper');
		this.el_zoomImageWrapper.inject(this.el_zoomImage, 'before');
		this.el_zoomImage.inject(this.el_zoomImageWrapper);
		
		this.el_zoomAreaMarker = new Element('span.lsZoomAreaMarker');
		this.el_zoomAreaMarker.inject(this.el_zoomImageWrapper, 'bottom');

		var elementTypeZoomBigBox = this.__module.__parentModule.__models.options.data.bigBoxFitsThumb == true ? 'span' : 'div';
		this.el_zoomBigBox = new Element(elementTypeZoomBigBox + '.lsZoomBigBox');
		
		if (this.__module.__parentModule.__models.options.data.bigBoxFitsThumb == true) {
			this.el_zoomBigBox.inject(this.el_zoomImageWrapper, 'top');
		} else if (this.__module.__parentModule.__models.options.data.bigBoxContainerSelector != '' && $$(this.__module.__parentModule.__models.options.data.bigBoxContainerSelector)[0] != undefined) {
			this.el_zoomBigBox.inject($$(this.__module.__parentModule.__models.options.data.bigBoxContainerSelector)[0], 'bottom');
		} else {
			this.el_zoomBigBox.inject(this.el_zoomImageWrapper, 'top');
		}

		this.el_zoomedImage = new Element('img').setProperties({'src': this.__module.obj_args.str_href, 'alt': ''}).setStyle('display', 'none');
		this.el_zoomedImagePreloader = new Element('div.lsZoomPreloader');
		this.el_zoomBigBox.adopt(
			this.el_zoomedImagePreloader,
			this.el_zoomedImage
		);
		
		this.el_zoomedImage.addEvent('load', this.removePreloader.bind(this));
		
		this.el_zoomImageWrapper.addEvent('mouseenter', this.showBigBox.bind(this));
		this.el_zoomImageWrapper.addEvent('mouseleave', this.hideBigBox.bind(this));
		
		if (typeOf(this.__module.__parentModule.__models.options.data.func_afterInit) === 'function') {
			this.__module.__parentModule.__models.options.data.func_afterInit(this);
		}
	},
	
	startZoomer: function() {
		this.el_zoomImageWrapper.setStyles({
			'position': 'relative',
			'width': 'auto',
			'height': 'auto'
		});
		
		this.obj_zoomImageSize = this.el_zoomImage.measure(function() {
			return this.getSize();
		});

		if (this.__module.__parentModule.__models.options.data.bigBoxFitsThumb == true) {
			this.__module.__parentModule.__models.options.data.bigBoxSize = this.obj_zoomImageSize;
		}
		
		this.getZoomImagePosition();
		
		this.el_zoomImageWrapper.setStyles({
			'width': this.obj_zoomImageSize.x,
			'height': this.obj_zoomImageSize.y
		});
		
		this.el_zoomBigBox.setStyles({
			'width': this.__module.__parentModule.__models.options.data.bigBoxSize.x,
			'height': this.__module.__parentModule.__models.options.data.bigBoxSize.y,
			'left': 0,
			'top': 0,
			'position': 'absolute'
		});
		
		if (
				this.__module.__parentModule.__models.options.data.bigBoxFitsThumb == false
			&&	(this.__module.__parentModule.__models.options.data.bigBoxContainerSelector == '' || $$(this.__module.__parentModule.__models.options.data.bigBoxContainerSelector)[0] == undefined)
		) {
			var topDistance = 0;
			var leftDistance = 0;
			switch(this.__module.__parentModule.__models.options.data.side) {
				case 'top':
					topDistance = (topDistance - this.__module.__parentModule.__models.options.data.bigBoxSize.y) + this.__module.__parentModule.__models.options.data.offset.y;
					leftDistance = this.__module.__parentModule.__models.options.data.offset.x;
					break;
	
				case 'bottom':
					topDistance = (topDistance + this.obj_zoomImageSize.y) + this.__module.__parentModule.__models.options.data.offset.y;
					leftDistance = this.__module.__parentModule.__models.options.data.offset.x;
					break;
	
				case 'left':
					topDistance = this.__module.__parentModule.__models.options.data.offset.y;
					leftDistance = (leftDistance - this.__module.__parentModule.__models.options.data.bigBoxSize.x) + this.__module.__parentModule.__models.options.data.offset.x;
					break;
	
				case 'right':
					topDistance = this.__module.__parentModule.__models.options.data.offset.y;
					leftDistance = (leftDistance + this.obj_zoomImageSize.x) + this.__module.__parentModule.__models.options.data.offset.x;
					break;
			}
			
			this.el_zoomBigBox.setStyles({
				'left': leftDistance + 'px',
				'top': topDistance + 'px'
			});
		}
		
		this.setZoomAreaMarkerSize();
		this.initializeZoomAreaMarkerMovement();
	},
	
	showBigBox: function() {
		this.el_zoomBigBox.setStyle('display', 'block');
		this.showZoomAreaMarker();
	},
	
	hideBigBox: function() {
		this.el_zoomBigBox.setStyle('display', 'none');
		this.hideZoomAreaMarker();
	},
	
	removePreloader: function() {
		this.el_zoomedImage.setStyle('display', 'inline');
		this.el_zoomedImagePreloader.destroy();
		this.startZoomer();
	},
	
	setZoomAreaMarkerSize: function() {
		var objZoomAreaMarkerStyles;
		
		this.obj_zoomedImageSize = this.el_zoomedImage.measure(function() {
			return this.getSize();
		});

		this.obj_zoomAreaMarkerBorderSize = {
			'left': this.el_zoomAreaMarker.getStyle('border-left-width'),
			'right': this.el_zoomAreaMarker.getStyle('border-right-width'),
			'top': this.el_zoomAreaMarker.getStyle('border-top-width'),
			'bottom': this.el_zoomAreaMarker.getStyle('border-bottom-width')
		};

		this.obj_zoomAreaMarkerBorderSize = {
			'left': parseInt(this.obj_zoomAreaMarkerBorderSize.left.substring(0,this.obj_zoomAreaMarkerBorderSize.left.length - 2)),
			'right': parseInt(this.obj_zoomAreaMarkerBorderSize.right.substring(0,this.obj_zoomAreaMarkerBorderSize.right.length - 2)),
			'top': parseInt(this.obj_zoomAreaMarkerBorderSize.top.substring(0,this.obj_zoomAreaMarkerBorderSize.top.length - 2)),
			'bottom': parseInt(this.obj_zoomAreaMarkerBorderSize.bottom.substring(0,this.obj_zoomAreaMarkerBorderSize.bottom.length - 2))
		};
		
		this.int_zoomAreaMarkerWidth = this.obj_zoomImageSize.x / (this.obj_zoomedImageSize.x / this.__module.__parentModule.__models.options.data.bigBoxSize.x);
		this.int_zoomAreaMarkerWidth = this.int_zoomAreaMarkerWidth > this.obj_zoomImageSize.x ? this.obj_zoomImageSize.x : this.int_zoomAreaMarkerWidth;
		
		this.int_zoomAreaMarkerHeight = this.obj_zoomImageSize.y / (this.obj_zoomedImageSize.y / this.__module.__parentModule.__models.options.data.bigBoxSize.y);
		this.int_zoomAreaMarkerHeight = this.int_zoomAreaMarkerHeight > this.obj_zoomImageSize.y ? this.obj_zoomImageSize.y : this.int_zoomAreaMarkerHeight;
		
		objZoomAreaMarkerStyles = {
			'width': (this.int_zoomAreaMarkerWidth - this.obj_zoomAreaMarkerBorderSize.left - this.obj_zoomAreaMarkerBorderSize.right).round(),
			'height': (this.int_zoomAreaMarkerHeight - this.obj_zoomAreaMarkerBorderSize.top - this.obj_zoomAreaMarkerBorderSize.bottom).round()
		};
		
		this.el_zoomAreaMarker.setStyles(objZoomAreaMarkerStyles);
	},
	
	initializeZoomAreaMarkerMovement: function() {
		this.el_zoomImageWrapper.addEvent('mousemove', this.moveZoomAreaMarker.bind(this));
	},
	
	moveZoomAreaMarker: function(event) {
		/*
		 * The mouse position (relative to the hovered image) represents the center of the zoomAreaMarker
		 */
		var mouseX = event.page.x - this.obj_zoomImagePosition.x;
		mouseX = mouseX > this.obj_zoomImageSize.x ? this.obj_zoomImageSize.x : mouseX;
		
		var mouseY = event.page.y - this.obj_zoomImagePosition.y;
		mouseY = mouseY > this.obj_zoomImageSize.y ? this.obj_zoomImageSize.y : mouseY;
		
		this.int_zoomAreaMarkerLeft = mouseX - (this.int_zoomAreaMarkerWidth / 2);
		if (this.int_zoomAreaMarkerLeft + this.int_zoomAreaMarkerWidth > this.obj_zoomImageSize.x) {
			this.int_zoomAreaMarkerLeft = this.obj_zoomImageSize.x - this.int_zoomAreaMarkerWidth;
		}
		if (this.int_zoomAreaMarkerLeft < 0) {
			this.int_zoomAreaMarkerLeft = 0;
		} 
		
		this.int_zoomAreaMarkerTop = mouseY - (this.int_zoomAreaMarkerHeight / 2);
		if (this.int_zoomAreaMarkerTop + this.int_zoomAreaMarkerHeight > this.obj_zoomImageSize.y) {
			this.int_zoomAreaMarkerTop = this.obj_zoomImageSize.y - this.int_zoomAreaMarkerHeight;
		}
		if (this.int_zoomAreaMarkerTop < 0) {
			this.int_zoomAreaMarkerTop = 0;
		}
		
		this.el_zoomAreaMarker.setStyles({
			'left': this.int_zoomAreaMarkerLeft,
			'top': this.int_zoomAreaMarkerTop
		});
		
		this.adjustBigBoxOffset();
	},
	
	adjustBigBoxOffset: function() {
		var objOffsets = {
			x: this.obj_zoomedImageSize.x / (this.obj_zoomImageSize.x / this.int_zoomAreaMarkerLeft),
			y: this.obj_zoomedImageSize.y / (this.obj_zoomImageSize.y / this.int_zoomAreaMarkerTop)
		}
		this.el_zoomedImage.setStyles({
			'left': objOffsets.x * -1,
			'top': objOffsets.y * -1
		});
	},
	
	showZoomAreaMarker: function() {
		this.el_zoomAreaMarker.setStyle('display', 'block');
	},
	
	hideZoomAreaMarker: function() {
		this.el_zoomAreaMarker.setStyle('display', 'none');
	},
	
	getZoomImagePosition: function() {
		if (typeOf(this.__module.__parentModule.__models.options.data.func_beforePositionDetection) === 'function') {
			this.__module.__parentModule.__models.options.data.func_beforePositionDetection(this);
		}
		
		this.obj_zoomImagePosition = this.el_zoomImage.measure(function() {
			return this.getPosition();
		});

		if (typeOf(this.__module.__parentModule.__models.options.data.func_afterPositionDetection) === 'function') {
			this.__module.__parentModule.__models.options.data.func_afterPositionDetection(this);
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();