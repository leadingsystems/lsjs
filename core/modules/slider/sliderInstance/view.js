(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_container: null,
	els_items: null,
	el_slidingArea: null,
    el_navigationArrowLeft: null,
    el_navigationArrowRight: null,
    el_navigationDotsContainer: null,
    els_navigationDots: null,


    float_windowWidth: null,
	float_slidingAreaMovingPositionX: null,
	float_requiredSlidingAreaWidth: null,
    float_requiredSlidingAreaHeight: null,
    float_visibleWidth: null,
    arr_allItemOffsets: null,
    arr_slideOffsets: null,
    int_currentSlideKey: null,
    bln_currentlyInTheMiddleOfTheSlide: null,
    bln_leftPossible: null,
    bln_rightPossible: null,
    bln_dragStartRequested: null,
    bln_currentlyDragging: null,
    bln_skipDrag: null,
    obj_dragData: null,


	start: function() {
	    this.determineGivenElements();

	    this.addNavigationArrows();

		this.initializeSlider();

        window.addEvent(
        	'resize',
			this.reinitializeSlider.bind(this)
		);

	},

    determineGivenElements: function() {
        this.el_container = this.__el_container;
        this.el_container.setStyle('overflow', 'hidden');
        this.el_container.addClass('lsjs-slider');
        if (this.el_container.getStyle('position') === 'static') {
            this.el_container.setStyle('position', 'relative');
        }
        this.els_items = this.el_container.getElements('> *');
    },

    addNavigationArrows: function() {
	    this.el_navigationArrowLeft = new Element('div.arrow');
	    this.el_navigationArrowRight = new Element('div.arrow');

	    this.el_container.adopt(
	        new Element('div.navigation-arrow-container.left').adopt(
                this.el_navigationArrowLeft
            ),
	        new Element('div.navigation-arrow-container.right').adopt(
                this.el_navigationArrowRight
            )
        );

	    this.el_navigationArrowLeft.addEvent(
	        'click',
            this.jumpLeft.bind(this)
        );

	    this.el_navigationArrowRight.addEvent(
	        'click',
            this.jumpRight.bind(this)
        );
    },

    addNavigationDots: function() {
	    if (this.arr_slideOffsets.length <= 1) {
	        return;
        }

	    this.el_navigationDotsContainer = new Element('div.navigation-dots-container');

        Array.each(
            this.arr_slideOffsets,
            function(float_slideOffset, int_slideKey) {
                this.els_navigationDots.push(new Element('span.navigation-dot').setProperty('data-misc-slide', int_slideKey));
            }.bind(this)
        );

        this.el_container.adopt(
            this.el_navigationDotsContainer.adopt(
                this.els_navigationDots
            )
        );

        this.els_navigationDots.addEvent(
            'click',
            function(event) {
                this.moveSlidingAreaTo(this.arr_slideOffsets[event.target.getProperty('data-misc-slide')]);
                this.determineCurrentSlideKey();
                this.determineMovingPossibilites();
            }.bind(this)
        );
    },

    removeNavigationDots: function() {
        if (this.arr_slideOffsets.length <= 1) {
            return;
        }

        this.el_navigationDotsContainer.destroy();
    },

    initializeSlider: function() {
	    this.resetVariables();

		this.storeItemSizeInformation();

        /*
         * In order to allow the web designer to style items with a width relative to the original parent element
         * (i.e. before inserting the sliding area element that the web designer doesn't know anything about)
         * we have to set the calculated width as a fixed width and we have to do it before we insert the sliding area.
         */
        this.setItemsToFixedWidth();

        this.insertSlidingArea();

        this.getVisibleWidth();

        this.getItemOffsets();

        this.getSlideOffsets();

        this.addNavigationDots();

        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();

        this.dragInitialize();
	},

	reinitializeSlider: function() {
        /*
         * Only reinitialize the slider if the window's width changed. Changes in height are irrelevant.
         */
	    if (this.float_windowWidth === window.innerWidth) {
	        return;
        }

	    this.removeSlidingArea();
	    this.removeNavigationDots();
		this.unsetItemsFixedWidth();
		this.initializeSlider();
	},

    resetVariables: function() {
	    this.float_windowWidth = window.innerWidth;

        this.float_slidingAreaMovingPositionX = 0;
        this.float_requiredSlidingAreaWidth = 0;
        this.float_requiredSlidingAreaHeight = 0;

        this.float_visibleWidth = 0;

        this.arr_allItemOffsets = [];
        this.arr_slideOffsets = [];

        this.els_navigationDots = new Elements();

        this.int_currentSlideKey = 0;

        this.bln_currentlyInTheMiddleOfTheSlide = false;

        this.bln_leftPossible = true;
        this.bln_rightPossible = true;

        this.obj_dragData = {
            firstPointerPosition: {
                x: null,
                y: null
            },
            dragStartPosition:  {
                x: null
            },
            dragOffsetPosition: {
                x: 0
            },
            dragDirection: {
                x: 'left'
            },
            bln_dragged: false
        };

        this.bln_dragStartRequested = false;
        this.bln_currentlyDragging = false;
        this.bln_skipDrag = false;
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

    getVisibleWidth: function() {
	    this.float_visibleWidth = this.el_container.clientWidth;
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
                                float_marginRight: obj_computedSize['margin-right'],
                                float_paddingLeft: obj_computedSize['padding-left'],
                                float_paddingRight: obj_computedSize['padding-right'],
                                float_widthIncludingMarginLeft: this.offsetWidth + obj_computedSize['margin-left'],
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
                        this.setStyles({
                            'width': this.retrieve('itemSizeInformation').float_originalWidth,
                            'margin-left': this.retrieve('itemSizeInformation').float_marginLeft,
                            'margin-right': this.retrieve('itemSizeInformation').float_marginRight,
                            'padding-left': this.retrieve('itemSizeInformation').float_paddingLeft,
                            'padding-right': this.retrieve('itemSizeInformation').float_paddingRight
                        });
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

    getSlideOffsets: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                /*
                 * Determine the xFrom and xTo coordinates of the last slide. If there was no last slide, both are 0
                 */
                var obj_lastSlideCoordinates = {
                    /*
                     * float_xFrom is 0 if there was no last slide or the last slide's offset
                     */
                    float_xFrom: this.arr_slideOffsets.length === 0 ? 0 : this.arr_slideOffsets[this.arr_slideOffsets.length - 1],

                    /*
                     * float_xTo is 0 if there was no last slide or the last slide's offset plus the slider's visible width
                     */
                    float_xTo: this.arr_slideOffsets.length === 0 ? 0 : (this.arr_slideOffsets[this.arr_slideOffsets.length - 1] + this.float_visibleWidth)
                };

                /*
                 * We determine each item's xFrom and xTo coordinate because we need those to find out whether we
                 * need a new slide for this item.
                 *
                 * An item's xFrom coordinate is the item's actual offsetLeft minus it's marginLeft.
                 * An item's xTo coordinate is the item's xFrom coordinate plus it's left margin and it's width
                 */
                var float_itemXFrom = el_item.offsetLeft - el_item.retrieve('itemSizeInformation').float_marginLeft;

                var obj_itemCoordinates = {
                    float_xFrom: float_itemXFrom,
                    float_xTo: float_itemXFrom + el_item.retrieve('itemSizeInformation').float_widthIncludingMarginLeft
                };

                /*
                 * Now, we look if the item that we are currently trying to fit into an already existing slide has an
                 * xTo coordinate that is beyond the last slider's xTo coordinate. If that is the the case, we push
                 * another slide to the slides offset array using the item's xFrom coordinate as the slide's offset.
                 */
                if (obj_itemCoordinates.float_xTo > obj_lastSlideCoordinates.float_xTo) {
                    this.arr_slideOffsets.push(obj_itemCoordinates.float_xFrom);
                }
            }.bind(this)
        );

        /*
         * If the last slide is not as wide as the slider's visible width, we move it's offset further left to
         * make it this wide.
         */
        if (this.__module.__parentModule.__models.options.data.bln_lastSlideFilled) {
            if (this.float_requiredSlidingAreaWidth - this.arr_slideOffsets[this.arr_slideOffsets.length - 1] < this.float_visibleWidth) {
                this.arr_slideOffsets[this.arr_slideOffsets.length - 1] = this.float_requiredSlidingAreaWidth - this.float_visibleWidth;
            }
        }


        this.arr_slideOffsets.sort(
            function(a, b) {
                return a - b;
            }
        );
    },

    getClosestItemOffset: function() {
	    /*
	     * Depending on the drag direction, we set the closest offset to the first or last item by default
	     */
	    var float_closestOffset = this.obj_dragData.dragDirection.x === 'left' ? this.arr_allItemOffsets[this.arr_allItemOffsets.length - 1] : 0;

        var bln_alreadyFoundClosestOffset = false;

        Array.each(
            this.arr_allItemOffsets,
            function(float_itemOffset) {
                if (bln_alreadyFoundClosestOffset) {
                    return;
                }

                if (this.obj_dragData.dragDirection.x === 'left') {
                    if (float_itemOffset > this.obj_dragData.dragOffsetPosition.x * -1) {
                        float_closestOffset = float_itemOffset;
                        bln_alreadyFoundClosestOffset = true;
                    }
                } else {
                    if (float_itemOffset < this.obj_dragData.dragOffsetPosition.x * -1) {
                        float_closestOffset = float_itemOffset;
                    }
                }
            }.bind(this)
        );

        /*
         * Make sure that the offset can not be beyond the last slide's offset
         */
        if (
            float_closestOffset > this.arr_slideOffsets[this.arr_slideOffsets.length - 1]
        ) {
            float_closestOffset = this.arr_slideOffsets[this.arr_slideOffsets.length - 1];
        }

        return float_closestOffset;
    },

    dragInitialize: function() {
	    if (this.check_isTouchDevice()) {
            this.el_slidingArea.addEvent(
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
        } else {
            this.el_slidingArea.addEvent(
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
        }
    },

    dragStart: function(event) {
	    if (this.bln_skipDrag) {
	        return;
        }

        this.bln_dragStartRequested = true;

        this.obj_dragData.firstPointerPosition.x = (event.type === 'touchstart' ? event.event.touches[0].clientX : event.event.clientX);
        this.obj_dragData.firstPointerPosition.y = (event.type === 'touchstart' ? event.event.touches[0].clientY : event.event.clientY);
    },

    dragEnd: function(event) {
        this.bln_dragStartRequested = false;

        if (this.bln_skipDrag || !this.obj_dragData.bln_dragged) {
            this.bln_skipDrag = false;
            return;
        }

        if (!this.bln_currentlyDragging) {
            return;
        }

        this.activateSlidingAreaTransitionAnimation();

        this.moveSlidingAreaTo(this.getClosestItemOffset());


        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();

        this.bln_currentlyDragging = false;
    },

    drag: function(event) {
	    /*
	     * Check if the pointer was moved more horizontal than vertical and only then start actually dragging
	     */
        if (this.bln_dragStartRequested) {
            var float_verticalDragDistance = this.obj_dragData.firstPointerPosition.y - (event.type === 'touchmove' ? event.event.touches[0].clientY : event.event.clientY);
            var float_horizontalDragDistance = this.obj_dragData.firstPointerPosition.x - (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX);

            if (float_verticalDragDistance < 0) {
                float_verticalDragDistance = float_verticalDragDistance * -1;
            }

            if (float_horizontalDragDistance < 0) {
                float_horizontalDragDistance = float_horizontalDragDistance * -1;
            }

            /*
             * The pointer went sideways, so we actually start dragging
             */
            if (float_horizontalDragDistance > float_verticalDragDistance) {
                this.bln_currentlyDragging = true;
                this.obj_dragData.dragStartPosition.x = this.obj_dragData.firstPointerPosition.x - this.obj_dragData.dragOffsetPosition.x;

                this.deactivateSlidingAreaTransitionAnimation();

            }

            this.bln_dragStartRequested = false;
        }

        if (!this.bln_currentlyDragging) {
            return;
        }

        event.preventDefault();

        this.obj_dragData.bln_dragged = true;

        var float_oldDragOffsetPositionX = this.obj_dragData.dragOffsetPosition.x;

        this.obj_dragData.dragOffsetPosition.x = (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX) - this.obj_dragData.dragStartPosition.x;

        if (float_oldDragOffsetPositionX < this.obj_dragData.dragOffsetPosition.x) {
            this.obj_dragData.dragDirection.x = 'right';
        }

        if (float_oldDragOffsetPositionX > this.obj_dragData.dragOffsetPosition.x) {
            this.obj_dragData.dragDirection.x = 'left';
        }

        this.moveSlidingAreaTo(this.obj_dragData.dragOffsetPosition.x * -1);
    },

    moveSlidingAreaTo: function(float_targetPositionX) {
        this.float_slidingAreaMovingPositionX = float_targetPositionX;
        this.obj_dragData.dragOffsetPosition.x = this.float_slidingAreaMovingPositionX * -1;

        this.el_slidingArea.setStyle(
            'transform',
            'translate3d(' + (this.float_slidingAreaMovingPositionX * -1) + 'px, 0, 0'
        );
    },

    jumpLeft: function() {
	    this.bln_skipDrag = true;

	    if (!this.bln_leftPossible) {
	        return;
        }

        /*
         * We move the sliding area to the current slide minus 1 unless we are currently in the middle of the current
         * slide in which case we move to the beginning of the current slide.
         */
        this.moveSlidingAreaTo(this.arr_slideOffsets[this.int_currentSlideKey === 0 ? this.int_currentSlideKey : (this.int_currentSlideKey - (this.bln_currentlyInTheMiddleOfTheSlide ? 0 : 1))]);

        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();
    },

    jumpRight: function() {
        this.bln_skipDrag = true;

	    if (!this.bln_rightPossible) {
	        return;
        }

        this.moveSlidingAreaTo(this.arr_slideOffsets[(this.int_currentSlideKey + 1)]);

        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();
    },

    determineCurrentSlideKey: function() {
        this.bln_currentlyInTheMiddleOfTheSlide = false;

        Array.each(
            this.arr_slideOffsets,
            function(float_slideOffset, int_slideKey) {
                if (
                    this.float_slidingAreaMovingPositionX >= float_slideOffset
                    && this.float_slidingAreaMovingPositionX < float_slideOffset + this.float_visibleWidth
                ) {
                    this.int_currentSlideKey = int_slideKey;
                    this.bln_currentlyInTheMiddleOfTheSlide = this.float_slidingAreaMovingPositionX !== float_slideOffset;
                }
            }.bind(this)
        );

        if (this.els_navigationDots.length) {
            this.els_navigationDots.removeClass('active');
            this.els_navigationDots[this.int_currentSlideKey].addClass('active');
        }
    },

    determineMovingPossibilites: function() {
        this.bln_rightPossible = true;
        this.bln_leftPossible = true;

        this.el_container.addClass('left-possible');
        this.el_container.addClass('right-possible');

        if (this.float_slidingAreaMovingPositionX >= this.float_requiredSlidingAreaWidth - this.float_visibleWidth) {
            this.bln_rightPossible = false;
            this.el_container.removeClass('right-possible');
        }

        if (this.float_slidingAreaMovingPositionX <= 0) {
            this.bln_leftPossible = false;
            this.el_container.removeClass('left-possible');
        }

    },

    check_isTouchDevice: function() {
        return 'ontouchstart' in document.documentElement;
    }
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();