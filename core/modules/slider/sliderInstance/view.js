(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_container: null,
	el_slidingArea: null,
	els_items: null,
	el_currentlyDragging: null,

	float_completeWidthOfAllItems: 0,
    float_maxHeightOfAllItems: 0,

	start: function() {
        this.el_container = this.__el_container;
        this.el_container.setStyle('overflow', 'hidden');
        this.el_container.addClass('lsjs-slider');
        this.els_items = this.el_container.getElements('> *');

		this.initializeElements();

        window.addEvent(
        	'resize',
			this.reinitializeSlider.bind(this)
		);

        this.el_container.addEvent(
        	'mousedown',
			this.dragStart.bind(this)
		);

        this.el_container.addEvent(
        	'mouseup',
			this.dragEnd.bind(this)
		);

        this.el_container.addEvent(
        	'mousemove',
			this.drag.bind(this)
		);

        this.el_container.addEvent(
        	'touchstart',
			this.dragStart.bind(this)
		);

        this.el_container.addEvent(
        	'touchend',
			this.dragEnd.bind(this)
		);

        this.el_container.addEvent(
        	'touchmove',
			this.drag.bind(this)
		);
	},

	dragStart: function(event) {
		this.el_currentlyDragging = this.el_slidingArea;

		var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

		if (obj_dragData === undefined || obj_dragData === null) {
            obj_dragData = {
				dragStartPosition:  {
					x: null
				},
				dragOffsetPosition: {
					x: 0
				}
			};
		}

		obj_dragData.dragStartPosition.x = (event.type === 'touchstart' ? event.event.touches[0].clientX : event.event.clientX) - obj_dragData.dragOffsetPosition.x;

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);
	},

	dragEnd: function(event) {
        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);

        this.el_currentlyDragging = null;
	},

	drag: function(event) {
		if (this.el_currentlyDragging === null) {
			return;
		}

		event.preventDefault();

        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        obj_dragData.dragOffsetPosition.x = (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX) - obj_dragData.dragStartPosition.x;

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);

        this.performDragMove();
	},

	performDragMove: function() {
        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        this.el_currentlyDragging.setStyle(
			'transform',
			'translate3d(' + obj_dragData.dragOffsetPosition.x + 'px, 0, 0'
		);
	},

	initializeElements: function() {
		this.storeItemSizeInformation();

        /*
         * In order to allow the web designer to style items with a width relative to the original parent element
         * (i.e. before inserting the sliding area element that the web designer doesn't know anything about)
         * we have to set the calculated width as a fixed width and we have to do it before we insert the sliding area.
         */
        this.setItemsToFixedWidth();

        this.el_slidingArea = new Element('div.sliding-area');
        this.el_slidingArea.inject(this.el_container);
        this.el_slidingArea.adopt(this.els_items);

        this.getCompleteWidthOfAllItems();
        this.getMaxHeightOfAllItems();

        this.setSlidingAreaSize();
	},

	reinitializeSlider: function() {
		this.el_slidingArea.destroy();
		this.unsetItemsFixedWidth();
		this.el_container.adopt(this.els_items);

		this.initializeElements();
	},

	storeItemSizeInformation: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                el_item.measure(
                    function() {
                        var obj_computedSize = this.getComputedSize({
                            styles: ['margin']
                        });

                        this.store(
                        	'itemSizeInformation',
							{
                                float_completeWidthIncludingMargins: this.offsetWidth + obj_computedSize['margin-left'] + obj_computedSize['margin-right'],
								float_completeHeightIncludingMargins: this.offsetHeight + obj_computedSize['margin-top'] + obj_computedSize['margin-bottom'],
								float_originalWidth: this.getComputedSize().width
							}
						);
                    }
                );
            }
        );
	},

	setItemsToFixedWidth: function() {
		Array.each(
			this.els_items,
			function(el_item) {
				el_item.measure(
					function() {
						this.setStyle('width', this.retrieve('itemSizeInformation').float_originalWidth);
                    }
				);
			}
		);
	},

	unsetItemsFixedWidth: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                el_item.removeProperty('style');
            }
        );
	},
	
	setSlidingAreaSize: function() {
		this.el_slidingArea.setStyles({
			'width': this.float_completeWidthOfAllItems + 'px',
			'height': this.float_maxHeightOfAllItems + 'px'
		})
	},

	getCompleteWidthOfAllItems: function() {
		var float_completeWidth = 0;

		Array.each(
			this.els_items,
			function(el_item) {
				float_completeWidth += el_item.retrieve('itemSizeInformation').float_completeWidthIncludingMargins;
			}.bind(this)
		);

        this.float_completeWidthOfAllItems = float_completeWidth;
	},

	getMaxHeightOfAllItems: function() {
		var float_maxHeight = 0;

		Array.each(
            this.els_items,
            function(el_item) {
            	var float_itemHeight = el_item.retrieve('itemSizeInformation').float_completeHeightIncludingMargins;
            	if (float_maxHeight < float_itemHeight) {
                    float_maxHeight = float_itemHeight;
				}
            }.bind(this)
        );

        this.float_maxHeightOfAllItems = float_maxHeight;
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();