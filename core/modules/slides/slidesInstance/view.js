(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_slideboxContent: null,
	obj_contentSize: null,
	
	el_slideboxContentSizeProtector: null,
	
	el_slidebox: null,
	
	el_buttonUp: null,
	el_buttonRight: null,
	el_buttonDown: null,
	el_buttonLeft: null,

	obj_currentPosition: {
		x: 0,
		y: 0
	},
	
	start: function() {
		this.el_slideboxContent = this.__el_container;
		
		this.performAutoSize();
		
		this.obj_contentSize = this.el_slideboxContent.measure(function() {
			return this.getSize();
		});

		
		// Create the slidebox element and set the given slideboxSize
		this.el_slidebox = new Element('div.lsSlideboxContainer' + (this.__module.__parentModule.__models.options.data.containerClass != '' ? '.' + this.__module.__parentModule.__models.options.data.containerClass : ''));
		this.el_slidebox.setStyles({
			width: this.__module.__parentModule.__models.options.data.slideboxSize.x,
			height: this.__module.__parentModule.__models.options.data.slideboxSize.y,
			overflow: 'hidden',
			position: 'relative'
		});
		
		// Inject the slidebox so that it gets it's real dimensions (e.g. if the size is given percentaged)
		this.el_slidebox.inject(this.el_slideboxContent, 'before');
		
		// overwrite the given slideboxSize with the actual size
		this.updateSlideboxSize();
		
		/*
		 * el_slideboxContentSizeProtector is needed because a content with a variable width would adjust to the
		 * smaller slidebox if injected into it and that must not happen. Therefore el_slideboxContentSizeProtector
		 * gets exactly the size that the content had before injecting it into the slidebox and thus preserves the
		 * contents size.
		 * 
		 * el_slideboxContentSizeProtector is also the container that actually gets slided.
		 */
		this.el_slideboxContentSizeProtector = new Element('div').setStyles({
			width: this.obj_contentSize.x,
			height: this.obj_contentSize.y
		});
		
		this.el_slideboxContentSizeProtector.setStyles({
			position: 'absolute',
			top: this.obj_currentPosition.y,
			left: this.obj_currentPosition.x
		});
		
		this.el_slideboxContentSizeProtector.set('morph', {duration: this.__module.__parentModule.__models.options.data.duration, transition: this.__module.__parentModule.__models.options.data.transition});
		
		this.el_buttonUp = new Element('div.button.buttonUp').addEvents({click: this.moveUp.bind(this), dblclick: this.preventSelection});
		this.el_buttonRight = new Element('div.button.buttonRight').addEvents({click: this.moveRight.bind(this), dblclick: this.preventSelection});
		this.el_buttonDown = new Element('div.button.buttonDown').addEvents({click: this.moveDown.bind(this), dblclick: this.preventSelection});
		this.el_buttonLeft = new Element('div.button.buttonLeft').addEvents({click: this.moveLeft.bind(this), dblclick: this.preventSelection});
		
		this.el_slidebox.adopt(
			this.el_slideboxContentSizeProtector,
			this.el_buttonUp,
			this.el_buttonRight,
			this.el_buttonDown,
			this.el_buttonLeft
		);
		
		this.el_buttonUp.setStyle('left', this.__module.__parentModule.__models.options.data.slideboxSize.x / 2 - this.el_buttonUp.measure(function() { return this.getSize();}).x / 2);
		this.el_buttonRight.setStyle('top', this.__module.__parentModule.__models.options.data.slideboxSize.y / 2 - this.el_buttonRight.measure(function() { return this.getSize();}).y / 2);
		this.el_buttonDown.setStyle('left', this.__module.__parentModule.__models.options.data.slideboxSize.x / 2 - this.el_buttonDown.measure(function() { return this.getSize();}).x / 2);
		this.el_buttonLeft.setStyle('top', this.__module.__parentModule.__models.options.data.slideboxSize.y / 2 - this.el_buttonLeft.measure(function() { return this.getSize();}).y / 2);

		this.el_slideboxContent.inject(this.el_slideboxContentSizeProtector);
		
		this.setMovingPossibilitiyClasses();
		
		if (this.__module.__parentModule.__models.options.data.blnUpdateMovingPossibilityClassesOnWindowResize) {
			window.addEvent('resize', this.setMovingPossibilitiyClasses.bind(this));
		}
	},
	
	updateSlideboxSize: function() {
		this.__module.__parentModule.__models.options.data.slideboxSize = this.el_slidebox.measure(function() {
			return this.getSize();
		});
	},
	
	performAutoSize: function() {
		var el_target;
		if (
				this.__module.__parentModule.__models.options.data.autoSize == undefined
			||	this.__module.__parentModule.__models.options.data.autoSize == null
			||	this.__module.__parentModule.__models.options.data.autoSize.targetSelector == undefined
			||	this.__module.__parentModule.__models.options.data.autoSize.targetSelector == null
			||	this.__module.__parentModule.__models.options.data.autoSize.countingElementSelector == undefined
			||	this.__module.__parentModule.__models.options.data.autoSize.countingElementSelector == null
			||	this.__module.__parentModule.__models.options.data.autoSize.sizePerElement == undefined
			||	this.__module.__parentModule.__models.options.data.autoSize.sizePerElement == null
			||	(
						(this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == undefined || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == null || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == 0 || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == '')
					&&	(this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == undefined || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == null || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == 0 || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == '')
				)
		) {
			return;
		}
		
		el_target = this.__module.__parentModule.__models.options.data.autoSize.targetSelector == '' ? this.el_slideboxContent : this.el_slideboxContent.getElement(this.__module.__parentModule.__models.options.data.autoSize.targetSelector);
		if (el_target == undefined || el_target == null) {
			return;
		}
		
		var offsetX = 0;
		var offsetY = 0;
		if (this.__module.__parentModule.__models.options.data.autoSize.sizeOffset != undefined && this.__module.__parentModule.__models.options.data.autoSize.sizeOffset != null) {
			if (this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.x != undefined && this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.x != null) {
				offsetX = this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.x;
			}
			if (this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.y != undefined && this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.y != null) {
				offsetY = this.__module.__parentModule.__models.options.data.autoSize.sizeOffset.y;
			}
		}
		
		var numCountingElements = this.el_slideboxContent.getElements(this.__module.__parentModule.__models.options.data.autoSize.countingElementSelector).length;
		if (this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x != undefined && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x != null && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x != 0 && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x != '') {
			el_target.setStyle('width', this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x * numCountingElements + offsetX);
		}
		if (this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y != undefined && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y != null && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y != 0 && this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y != '') {
			el_target.setStyle('height', this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y * numCountingElements + offsetY);
		}
	},
	
	moveUp: function() {
		this.move('up');
	},
	
	moveRight: function() {
		this.move('right');
	},
	
	moveDown: function() {
		this.move('down');
	},
	
	moveLeft: function() {
		this.move('left');
	},
	
	preventSelection: function(event) {
		event.stop();
		if (window.getSelection) {
			if (window.getSelection().empty) {
				window.getSelection().empty();
			} else if (window.getSelection().removeAllRanges) {
				window.getSelection().removeAllRanges();
			}
		} else if (document.selection) {
			document.selection.empty();
		}
	},
	
	move: function(direction) {
		var objNewPosition = this.getNewPosition(direction);
		this.el_slideboxContentSizeProtector.morph({
			top: objNewPosition.y,
			left: objNewPosition.x
		});
		this.obj_currentPosition = objNewPosition;
		
		this.setMovingPossibilitiyClasses();
	},
	
	getMoveDistance: function(direction) {
		if (this.__module.__parentModule.__models.options.data.blnUseVariableSlideDistance) {
			this.updateSlideboxSize();
		}
		
		var distance = 0;
		
		switch(direction) {
			case 'up':
			case 'down':
				if (!this.__module.__parentModule.__models.options.data.blnUseVariableSlideDistance || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == undefined || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y == null) {
					distance = this.__module.__parentModule.__models.options.data.slideboxSize.y;
				} else {
					distance = Math.floor(this.__module.__parentModule.__models.options.data.slideboxSize.y / this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y) * this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.y;
				}
				distance = distance + this.__module.__parentModule.__models.options.data.slideDistanceOffset.y;
				break;

			case 'right':
			case 'left':
				if (!this.__module.__parentModule.__models.options.data.blnUseVariableSlideDistance || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == undefined || this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x == null) {
					distance = this.__module.__parentModule.__models.options.data.slideboxSize.x;
				} else {
					distance = Math.floor(this.__module.__parentModule.__models.options.data.slideboxSize.x / this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x) * this.__module.__parentModule.__models.options.data.autoSize.sizePerElement.x;
				}
				distance = distance + this.__module.__parentModule.__models.options.data.slideDistanceOffset.x;
				break;
		}
		
		return distance;
	},
	
	getNewPosition: function(direction) {
		var objNewPosition = {x: this.obj_currentPosition.x, y: this.obj_currentPosition.y};
		switch(direction) {
			case 'up':
				objNewPosition.y = this.obj_currentPosition.y + this.getMoveDistance(direction);
				break;

			case 'right':
				objNewPosition.x = this.obj_currentPosition.x - this.getMoveDistance(direction);
				break;

			case 'down':
				objNewPosition.y = this.obj_currentPosition.y - this.getMoveDistance(direction);
				break;

			case 'left':
				objNewPosition.x = this.obj_currentPosition.x + this.getMoveDistance(direction);
				break;
		}
		
		/*
		 * check if the new position is within the limits. If a value
		 * is outside the limits, set it to the old position value (do
		 * not move)
		 */
		if (objNewPosition.x > 0) {
			// objNewPosition.x = this.obj_currentPosition.x;
			objNewPosition.x = 0;
		}
		if (objNewPosition.y > 0) {
			// objNewPosition.y = this.obj_currentPosition.y;
			objNewPosition.y = 0;
		}
		if (objNewPosition.x <= this.obj_contentSize.x * -1) {
			objNewPosition.x = this.obj_currentPosition.x;
		}
		if (objNewPosition.y <= this.obj_contentSize.y * -1) {
			objNewPosition.y = this.obj_currentPosition.y;
		}
		return objNewPosition;
	},
	
	setMovingPossibilitiyClasses: function() {
		this.setMovingPossibilitiyClass('up');
		this.setMovingPossibilitiyClass('right');
		this.setMovingPossibilitiyClass('down');
		this.setMovingPossibilitiyClass('left');
	},
	
	setMovingPossibilitiyClass: function(direction) {
		var objNewPosition = this.getNewPosition(direction);
		if (objNewPosition.y != this.obj_currentPosition.y || objNewPosition.x != this.obj_currentPosition.x) {
			this.el_slidebox.addClass(direction + 'Possible');
			this.el_slidebox.removeClass(direction + 'Impossible');
		} else {
			this.el_slidebox.removeClass(direction + 'Possible');
			this.el_slidebox.addClass(direction + 'Impossible');
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();