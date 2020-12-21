(function() {

// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
    el_body: null,
    el_container: null,
	els_items: null,
	el_slidingArea: null,
    el_navigationArrowLeft: null,
    el_navigationArrowRight: null,
    el_navigationDotsContainer: null,
    els_navigationDots: null,

    bln_pointerInside: false,

    int_autoplayIntervalCallbackId: null,


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

	    this.initializeOnce();

		this.initializeSlider();

        window.addEvent(
        	'resize',
			this.reinitializeSlider.bind(this)
		);
	},

    determineGivenElements: function() {
	    this.el_body = $$('body')[0];
        this.el_container = this.__el_container;
        this.el_container.addClass('lsjs-slider-applied');
        this.els_items = this.el_container.getElements('> *');
        this.ensureItemMinimumHeight();
    },

    /*
     * In some situations it might happen that an element has no height and that could prevent item positions from
     * being determined correctly. Therefore we set a min-height if necessary.
     */
    ensureItemMinimumHeight: function() {
        Array.each(
            this.els_items,
            function(el_item) {
                if (
                    !el_item.offsetHeight
                    && (
                        el_item.getStyle('min-height') === '0px'
                        || el_item.getStyle('min-height') === '0'
                        || el_item.getStyle('min-height') === 'auto'
                    )
                ) {
                    el_item.setStyle('min-height', '1px');
                }
            }
        );
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

    check_dotNavigationImagesArePossible: function() {
        /*
         * Image navigation can only be used if there's one item for each slide. Otherwise it would be unclear which
         * preview image to use for which slide.
         */
        if (this.arr_slideOffsets.length !== this.els_items.length) {
            return false;
        }

        var bln_previewImageExistForEachItem = true;

        Array.each(
            this.els_items,
            function(el_item) {
                if (!bln_previewImageExistForEachItem) {
                    return;
                }

                var el_previewImage = el_item.get('tag') === 'img' ? el_item : el_item.getElement('img');

                if (typeOf(el_previewImage) !== 'element') {
                    bln_previewImageExistForEachItem = false;
                    return;
                }

                el_item.store('previewImageSrc', el_previewImage.getProperty('src'));
            }
        );

        return bln_previewImageExistForEachItem;
    },

    addNavigationDots: function() {
	    if (
            !this.__module.__parentModule.__models.options.data.bln_dotNavigationActive
	        || this.arr_slideOffsets.length <= 1
	        || this.arr_slideOffsets.length > this.__module.__parentModule.__models.options.data.int_dotNavigationMaxNumberOfSlides
        ) {
	        return;
        }

        var bln_useDotNavigationImages = this.__module.__parentModule.__models.options.data.bln_dotNavigationUseImagesIfPossible && this.check_dotNavigationImagesArePossible();

	    this.el_navigationDotsContainer = new Element('div.navigation-dots-container');

        Array.each(
            this.arr_slideOffsets,
            function(float_slideOffset, int_slideKey) {
                var el_navigationDot = new Element('span.navigation-dot').setProperty('data-misc-slide', int_slideKey);

                if (bln_useDotNavigationImages) {
                    el_navigationDot.addClass('use-image');
                    el_navigationDot.setStyles({
                        'background-image': 'url(' +this.els_items[int_slideKey].retrieve('previewImageSrc') + ')',
                        'background-size': 'cover'
                    });
                }

                this.els_navigationDots.push(el_navigationDot);
            }.bind(this)
        );

        this.el_container.grab(
            this.el_navigationDotsContainer.adopt(
                this.els_navigationDots
            ),
            this.__module.__parentModule.__models.options.data.str_dotNavigationPosition
        );

        this.els_navigationDots.addEvent(
            'click',
            function(event) {
                if (this.__module.__parentModule.__models.options.data.bln_autoplayActive && event.target.getProperty('data-misc-slide') == this.int_currentSlideKey) {
                    this.toggleAutoplay();
                    return;
                }

                this.moveSlidingAreaTo(this.arr_slideOffsets[event.target.getProperty('data-misc-slide')]);
                this.determineCurrentSlideKey();
                this.determineMovingPossibilites();
            }.bind(this)
        );
    },

    removeNavigationDots: function() {
        if (typeOf(this.el_navigationDotsContainer) !== 'element') {
            return;
        }

        this.el_navigationDotsContainer.destroy();
    },

    initializeOnce: function() {
	    this.el_container.addEvent(
	        'mouseenter',
            function() {
                this.bln_pointerInside = true;
            }.bind(this)
        );

	    this.el_container.addEvent(
	        'mouseleave',
            function() {
                this.bln_pointerInside = false;
            }.bind(this)
        );

	    if (this.__module.__parentModule.__models.options.data.bln_autoplayActive) {
	        this.el_container.addClass('autoplay-active');

	        if (this.__module.__parentModule.__models.options.data.bln_autoplayPauseOnHover) {
                this.el_container.addEvent(
                    'mouseenter',
                    this.stopAutoplay.bind(this)
                );

                if (this.__module.__parentModule.__models.options.data.bln_autoplayStartInstantly) {
                    this.el_container.addEvent(
                        'mouseleave',
                        this.startAutoplay.bind(this)
                    );
                }
            }
        }
    },

    initializeSlider: function() {
        this.resetVariables();

		this.storeItemSizeInformation();

        /*
         * In order to allow the web designer to style items with a width relative to the original parent element
         * (i.e. before inserting the sliding area element that the web designer doesn't know anything about)
         * we have to set the calculated width as a fixed width and we have to do it before we insert the sliding area.
         */
        this.setContainerToFixedWidth();
        this.setItemsToFixedWidth();

        this.insertSlidingArea();

        this.getVisibleWidth();

        this.getItemOffsets();

        this.getSlideOffsets();

        this.addNavigationDots();

        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();

        this.dragInitialize();

        if (this.__module.__parentModule.__models.options.data.bln_autoplayActive) {
            if (
                this.__module.__parentModule.__models.options.data.bln_autoplayStartInstantly
                && (
                    !this.__module.__parentModule.__models.options.data.bln_autoplayPauseOnHover
                    || !this.bln_pointerInside
                )
            ) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
        }
	},

	reinitializeSlider: function() {
        /*
         * Only reinitialize the slider if the window's width changed. Changes in height are irrelevant.
         */
	    if (this.float_windowWidth === window.innerWidth) {
	        return;
        }

        if (this.__module.__parentModule.__models.options.data.bln_autoplayActive) {
            this.stopAutoplay();
        }

	    this.removeSlidingArea();
	    this.removeNavigationDots();
		this.unsetItemsFixedWidth();
		this.unsetContainerFixedWidth();
		this.initializeSlider();
	},

    startAutoplay: function() {
        this.el_container.removeClass('paused');
        this.el_container.addClass('playing');

	    if (this.int_autoplayIntervalCallbackId) {
	        return;

        }
        this.int_autoplayIntervalCallbackId = window.setInterval(
            this.autoplayMoveToNextSlide.bind(this),
            this.__module.__parentModule.__models.options.data.int_autoplayInterval
        );
    },

    stopAutoplay: function() {
        this.el_container.removeClass('playing');
        this.el_container.addClass('paused');

	    if (!this.int_autoplayIntervalCallbackId) {
	        return;
        }

        window.clearInterval(this.int_autoplayIntervalCallbackId);
        this.int_autoplayIntervalCallbackId = null;
    },

    toggleAutoplay: function() {
        if (this.int_autoplayIntervalCallbackId) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }

    },

    stopAndRestartAutoplay: function() {
        /*
         * We stop and restart autoplay to make sure that the next automatic slide after an explicit jump
         * waits the whole autoplay interval. If autoplay is set to not start instantly, we don't restart.
         */
        if (this.__module.__parentModule.__models.options.data.bln_autoplayActive) {
            this.stopAutoplay();

            if (
                this.__module.__parentModule.__models.options.data.bln_autoplayStartInstantly
                && (
                    !this.__module.__parentModule.__models.options.data.bln_autoplayPauseOnHover
                    || !this.bln_pointerInside
                )
            ) {
                this.startAutoplay();
            }
        }
    },

    autoplayMoveToNextSlide: function() {
	    var int_keyOfSlideToMoveTo = 0;
	    if (this.int_currentSlideKey < this.arr_slideOffsets.length - 1) {
	        int_keyOfSlideToMoveTo = this.int_currentSlideKey + 1;
        }
        this.moveSlidingAreaTo(this.arr_slideOffsets[int_keyOfSlideToMoveTo]);
        this.determineCurrentSlideKey();
        this.determineMovingPossibilites();
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
            float_slidingAreaMovingPositionXBeforeDrag: 0,
            float_horizontalDragDistance: 0,
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
        this.el_container.adopt(this.els_items);
        this.el_slidingArea.destroy();
    },

    getVisibleWidth: function() {
	    this.float_visibleWidth = this.el_container.clientWidth;
    },

	storeItemSizeInformation: function() {
        var self = this;
	    var str_containerDisplayStyle = this.el_container.getStyle('display');

        if (str_containerDisplayStyle === 'flex') {
            if (this.__module.__parentModule.__models.options.data.bln_showConsoleWarnings) {
                console.warn('LSJS SLIDER: The slider container is a flexbox which is not recommended. The container has now been set to "display: block;" and all elements have been set to "float: left;"');
                console.warn(this.el_container);
            }
            this.el_container.setStyle('display', 'block');

            Array.each(
                this.els_items,
                function(el_item) {
                    el_item.setStyles({
                        'display': 'block',
                        'float': 'left'
                    });
                }
            );
        }

        Array.each(
            this.els_items,
            function(el_item) {
                if (str_containerDisplayStyle === 'flex') {
                    el_item.setStyles({
                        'display': 'block',
                        'float': 'left'
                    });
                }

                el_item.measure(
                    function() {
                        var arr_itemStyles = this.getStyles('display', 'float');

                        if (self.__module.__parentModule.__models.options.data.bln_showConsoleWarnings) {
                            if (
                                arr_itemStyles['display'] !== 'inline'
                                && arr_itemStyles['display'] !== 'inline-block'
                                && arr_itemStyles['float'] === 'none'
                            ) {
                                console.warn('LSJS SLIDER: Element may not be able to align horizontally which is necessary for the slider to render correctly. Please make sure that all items in the slider align horizontally, e.g. by setting the display style of the elements to "inline" or "inline-block" or by floating the elements.');
                                console.warn(el_item);
                            }

                            if (
                                arr_itemStyles['float'] !== 'none'
                                && !this.offsetHeight
                            ) {
                                console.warn('LSJS SLIDER: Element has "float" set to "' + arr_itemStyles['float'] + '" but has zero height. This elements might might not be aligned as expected and the slider might not render correctly.')
                                console.warn(el_item);
                            }

                            if (!this.offsetWidth) {
                                console.warn('LSJS SLIDER: Element has zero width. The required width of the sliding area can therefore not be calculated correctly. This can happen if the element\'s size depends on a resource that hasn\'t been loaded yet (e.g. an image). Please make sure to explicitly set a width for such elements.');
                                console.warn(el_item);
                            }
                        }

                        var obj_computedSize = this.getComputedSize({
                            styles: ['margin', 'padding']
                        });

                        this.store(
                        	'itemSizeInformation',
							{
                                float_marginLeft: obj_computedSize['margin-left'],
                                float_marginRight: obj_computedSize['margin-right'],
                                float_paddingLeft: obj_computedSize['padding-left'],
                                float_paddingRight: obj_computedSize['padding-right'],
                                float_widthIncludingMarginLeft: obj_computedSize['width'] + obj_computedSize['margin-left'],
                                float_completeWidthIncludingMargins: obj_computedSize['width'] + obj_computedSize['margin-left'] + obj_computedSize['margin-right'],
                                float_completeHeightIncludingMargins: obj_computedSize['height'] + obj_computedSize['margin-top'] + obj_computedSize['margin-bottom'],
                                float_originalWidth: obj_computedSize['width']
                            }
			);
                    }
                );
            }
        );
	},

    setContainerToFixedWidth: function() {
        this.el_container.setStyles({
            'overflow': 'hidden',
            'width': this.el_container.getComputedSize().width,
            'max-width': 'unset',
            'position': this.el_container.getStyle('position') === 'static' ? 'relative' : this.el_container.getStyle('position'),
        });
    },

    unsetContainerFixedWidth: function() {
	    this.el_container.removeProperty('style');
    },

    setItemsToFixedWidth: function() {
		Array.each(
			this.els_items,
			function(el_item) {
				el_item.setStyles({
                    'width': Math.round(el_item.retrieve('itemSizeInformation').float_originalWidth),
                    'max-width': 'unset',
                    'margin-left': el_item.retrieve('itemSizeInformation').float_marginLeft,
                    'margin-right': el_item.retrieve('itemSizeInformation').float_marginRight,
                    'padding-left': el_item.retrieve('itemSizeInformation').float_paddingLeft,
                    'padding-right': el_item.retrieve('itemSizeInformation').float_paddingRight
                });
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
            'position': 'relative'
		})
	},

    activateSlidingAreaTransitionAnimation: function() {
        this.el_slidingArea.setStyle('transition', 'all ' + this.__module.__parentModule.__models.options.data.float_slidingAnimationDuration + 's ease 0s');
    },

    deactivateSlidingAreaTransitionAnimation: function() {
        this.el_slidingArea.setStyle('transition', 'none');
    },

	getRequiredSlidingAreaWidth: function() {
		var float_requiredWidth = 0;

		Array.each(
			this.els_items,
			function(el_item) {
                float_requiredWidth += Math.round(el_item.retrieve('itemSizeInformation').float_completeWidthIncludingMargins);
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
	    if (this.arr_slideOffsets.length <= 1) {
	        return;
        }

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
	        if (this.__module.__parentModule.__models.options.data.bln_mouseDragOnNonTouchDeviceActive) {
	            this.el_container.addClass('mouse-drag-active');

                this.el_slidingArea.addEvent(
                    'mousedown',
                    this.dragStart.bind(this)
                );

                this.el_body.addEvent(
                    'mouseup',
                    this.dragEnd.bind(this)
                );

                this.el_body.addEvent(
                    'mouseleave',
                    this.dragEnd.bind(this)
                );

                this.el_body.addEvent(
                    'mousemove',
                    this.drag.bind(this)
                );
            }
        }
    },

    dragStart: function(event) {
        if (this.__module.__parentModule.__models.options.data.bln_autoplayActive) {
            this.stopAutoplay();
        }

	    if (this.bln_skipDrag) {
	        return;
        }

        this.bln_dragStartRequested = true;

        this.obj_dragData.firstPointerPosition.x = (event.type === 'touchstart' ? event.event.touches[0].clientX : event.event.clientX);
        this.obj_dragData.firstPointerPosition.y = (event.type === 'touchstart' ? event.event.touches[0].clientY : event.event.clientY);

        this.obj_dragData.float_slidingAreaMovingPositionXBeforeDrag = this.float_slidingAreaMovingPositionX;
        this.obj_dragData.float_horizontalDragDistance = 0;
    },

    dragEnd: function(event) {
        if (
            this.__module.__parentModule.__models.options.data.bln_autoplayActive
            && this.__module.__parentModule.__models.options.data.bln_autoplayStartInstantly
            && (
                !this.__module.__parentModule.__models.options.data.bln_autoplayPauseOnHover
                || !this.bln_pointerInside
            )
        ) {
            this.startAutoplay();
        }

        this.bln_dragStartRequested = false;

        if (this.bln_skipDrag || !this.obj_dragData.bln_dragged) {
            this.bln_skipDrag = false;
            return;
        }

        if (!this.bln_currentlyDragging) {
            return;
        }

        this.activateSlidingAreaTransitionAnimation();

        /*
         * Move the sliding area either to the closest item offset or to the previous offset if the drag
         * was too small
         */
        if (this.obj_dragData.float_horizontalDragDistance < 0) {
            this.obj_dragData.float_horizontalDragDistance = this.obj_dragData.float_horizontalDragDistance * -1;
        }
        var float_newSlidingAreaOffset = this.obj_dragData.float_horizontalDragDistance > (this.__module.__parentModule.__models.options.data.float_minDragToSlide < 1 ? (this.float_visibleWidth * this.__module.__parentModule.__models.options.data.float_minDragToSlide) : this.__module.__parentModule.__models.options.data.float_minDragToSlide) ? this.getClosestItemOffset() : this.obj_dragData.float_slidingAreaMovingPositionXBeforeDrag;


        this.moveSlidingAreaTo(float_newSlidingAreaOffset);


        this.determineCurrentSlideKey();

        this.determineMovingPossibilites();

        this.bln_currentlyDragging = false;
        this.el_container.removeClass('dragging');
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
                this.el_container.addClass('dragging');
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

        this.obj_dragData.float_horizontalDragDistance = this.obj_dragData.firstPointerPosition.x - (event.type === 'touchmove' ? event.event.touches[0].clientX : event.event.clientX);

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
        this.stopAndRestartAutoplay();

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
        this.stopAndRestartAutoplay();

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

        /*
         * Due to inaccuracies in the calculation of sliding area's required width it might be 1px wider than it should be.
         * Therefore we subtract 1 before the following comparison.
         */
        if (this.float_slidingAreaMovingPositionX >= (this.float_requiredSlidingAreaWidth - 1) - this.float_visibleWidth) {
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
