(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_container: null,
	el_slidingArea: null,
	els_items: null,
	el_currentlyDragging: null,

	float_requiredSlidingAreaWidth: 0,
    float_requiredSlidingAreaHeight: 0,

    arr_allItemOffsets: [],

	start: function() {
	    this.determineGivenElements();

		this.initializeSlider();

		this.dragInitialize();

        window.addEvent(
        	'resize',
			this.reinitializeSlider.bind(this)
		);

	},

    determineGivenElements: function() {
        this.el_container = this.__el_container;
        this.el_container.setStyle('overflow', 'hidden');
        this.el_container.addClass('lsjs-slider');
        this.els_items = this.el_container.getElements('> *');
    },

	initializeSlider: function() {
		this.storeItemSizeInformation();

        /*
         * In order to allow the web designer to style items with a width relative to the original parent element
         * (i.e. before inserting the sliding area element that the web designer doesn't know anything about)
         * we have to set the calculated width as a fixed width and we have to do it before we insert the sliding area.
         */
        this.setItemsToFixedWidth();

        this.insertSlidingArea();

        this.getItemOffsets();
	},

	reinitializeSlider: function() {
	    this.removeSlidingArea();
		this.unsetItemsFixedWidth();
		this.removeAllItemOffsets();
		this.initializeSlider();
	},

    insertSlidingArea: function() {
        this.el_slidingArea = new Element('div.sliding-area');
        this.el_slidingArea.inject(this.el_container);
        this.el_slidingArea.adopt(this.els_items);

        this.getRequiredSlidingAreaWidth();
        this.getRequiredSlidingAreaHeight();
        this.setSlidingAreaSize();

        this.activateSlidingAreaTransitionAnimation();
    },

    removeSlidingArea: function() {
        this.el_slidingArea.destroy();
        this.el_container.adopt(this.els_items);
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
							    float_marginLeft: obj_computedSize['margin-left'],
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
			'width': this.float_requiredSlidingAreaWidth + 'px',
			'height': this.float_requiredSlidingAreaHeight + 'px',
            'position': 'relative'
		})
	},

    activateSlidingAreaTransitionAnimation: function() {
        this.el_slidingArea.setStyle('transition', 'all 0.25s ease 0s');
    },

    deactivateSlidingAreaTransitionAnimation: function() {
        this.el_slidingArea.setStyle('transition', 'none');
    },

	getRequiredSlidingAreaWidth: function() {
		var float_requiredWidth = 0;

		Array.each(
			this.els_items,
			function(el_item) {
				float_requiredWidth += el_item.retrieve('itemSizeInformation').float_completeWidthIncludingMargins;
			}.bind(this)
		);

        this.float_requiredSlidingAreaWidth = float_requiredWidth;
	},

	getRequiredSlidingAreaHeight: function() {
		var float_requiredHeight = 0;

		Array.each(
            this.els_items,
            function(el_item) {
            	var float_itemHeight = el_item.retrieve('itemSizeInformation').float_completeHeightIncludingMargins;
            	if (float_requiredHeight < float_itemHeight) {
                    float_requiredHeight = float_itemHeight;
				}
            }.bind(this)
        );

        this.float_requiredSlidingAreaHeight = float_requiredHeight;
	},

    getItemOffsets: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                var float_itemOffset = el_item.offsetLeft - el_item.retrieve('itemSizeInformation').float_marginLeft;
                this.arr_allItemOffsets.push(float_itemOffset);
            }.bind(this)
        );

        this.arr_allItemOffsets.sort(
            function(a, b) {
                return a - b;
            }
        );

    },

    removeAllItemOffsets: function() {
        this.arr_allItemOffsets = [];
    },

    getClosestItemOffset: function() {
        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

	    var float_closestOffset = obj_dragData.dragDirection.x === 'left' ? this.arr_allItemOffsets[this.arr_allItemOffsets.length - 1] : 0;

        var bln_alreadyFoundClosestOffset = false;

        Array.each(
            this.arr_allItemOffsets,
            function(float_itemOffset) {
                if (bln_alreadyFoundClosestOffset) {
                    return;
                }

                if (obj_dragData.dragDirection.x === 'left') {
                    if (float_itemOffset > obj_dragData.dragOffsetPosition.x * -1) {
                        float_closestOffset = float_itemOffset;
                        bln_alreadyFoundClosestOffset = true;
                    }
                } else {
                    if (float_itemOffset < obj_dragData.dragOffsetPosition.x * -1) {
                        float_closestOffset = float_itemOffset;
                    }
                }
            }
        );

        return float_closestOffset;
    },

    dragInitialize: function() {
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
                },
                dragDirection: {
                    x: 'left'
                }
            };
        }

        obj_dragData.dragStartPosition.x = (event.type === 'touchstart' ? event.event.touches[0].clientX : event.event.clientX) - obj_dragData.dragOffsetPosition.x;

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);

        this.deactivateSlidingAreaTransitionAnimation();
    },

    dragEnd: function(event) {
        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        obj_dragData.dragOffsetPosition.x = this.getClosestItemOffset() * -1;

        this.activateSlidingAreaTransitionAnimation();

        this.performDragMove();

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);

        this.el_currentlyDragging = null;
    },

    drag: function(event) {
        if (this.el_currentlyDragging === null) {
            return;
        }

        event.preventDefault();

        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        var float_oldDragOffsetPositionX = obj_dragData.dragOffsetPosition.x;

        obj_dragData.dragOffsetPosition.x = (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX) - obj_dragData.dragStartPosition.x;

        if (float_oldDragOffsetPositionX < obj_dragData.dragOffsetPosition.x) {
            obj_dragData.dragDirection.x = 'right';
        }

        if (float_oldDragOffsetPositionX > obj_dragData.dragOffsetPosition.x) {
            obj_dragData.dragDirection.x = 'left';
        }

        this.el_currentlyDragging.store('obj_dragData', obj_dragData);

        this.performDragMove();
    },

    performDragMove: function() {
        var obj_dragData = this.el_currentlyDragging.retrieve('obj_dragData');

        this.el_currentlyDragging.setStyle(
            'transform',
            'translate3d(' + obj_dragData.dragOffsetPosition.x + 'px, 0, 0'
        );
    }
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();